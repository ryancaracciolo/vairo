import dynamodb from '../config/dbConfig.js';
import openai from '../config/openaiClient.js';
import { PutCommand, QueryCommand, UpdateCommand, BatchWriteCommand, DeleteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { connectToSnowflake_customer, executeQuery } from './snowflakeController.js';
import Thread from '../objects/Thread.js';
import Message from '../objects/Message.js';
import { translatePostgresToSnowflake } from './helpers/sqlTranslation.js';
import pkg from 'pg';

const { Client } = pkg;
const tableName = 'vairo-table';

export const createThread = async (req, res) => {
  const { id, userId, title } = req.body;

  // Create a new Thread instance
  const thread = new Thread({ id, userId, title });
  const item = thread.toItem();

  const params = {
    TableName: tableName,
    Item: item,
  };

  try {
    const command = new PutCommand(params);
    await dynamodb.send(command);
    res.status(201).json({
      threadId: thread.id,
      message: 'Thread created successfully.',
    });
  } catch (err) {
    console.error(
      'Unable to create thread. Error JSON:',
      JSON.stringify(err, null, 2)
    );
    res
      .status(500)
      .json({ error: 'An error occurred while creating the thread.' });
  }
};
//////////////////////////////////////////////////////////////////////////////////////////

// Helper function to format dataset for the prompt
function formatDataset(dataItems) {
  let desc = '';
  dataItems.forEach((item) => {
    desc += `Table: ${item.content.tableName}\nColumns:\n`;
    item.content.columns.forEach((col) => {
      desc += ` - ${col.name} (${col.type})${col.primaryKey ? ' [Primary Key]' : ''}\n`;
    });
    if (item.content.foreignKeys && item.content.foreignKeys.length > 0) {
      desc += `Foreign Keys:\n`;
      item.content.foreignKeys.forEach((fk) => {
        desc += ` - ${fk.name}: ${fk.column} references ${fk.foreignTable}(${fk.foreignColumn})\n`;
      });
    }
    desc += '\n'; // Add a newline for separation between tables
  });
  return desc;
}

//////////////////////////////////////////////////////////////////////////////////////////
export const chatWithAI = async (req, res) => {
  const { threadId, dataSource, message } = req.body;

  if (!threadId || !dataSource || !message || !message.content) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  try {
    // Step 1: Fetch Conversation History
    const conversationParams = {
      TableName: tableName,
      KeyConditionExpression: 'PK = :threadPk AND begins_with(SK, :messagePrefix)',
      ExpressionAttributeValues: {
        ':threadPk': `THREAD#${threadId}`,
        ':messagePrefix': 'MESSAGE#',
      },
      ScanIndexForward: false, // Sorts the results in descending order to get the latest messages
      Limit: 10, // Limit to the last 10 messages
    };

    // Step 2: Fetch User's Dataset Structure
    const datasetParams = {
      TableName: tableName,
      KeyConditionExpression: 'PK = :dataSourcePk AND begins_with(SK, :tablePrefix)',
      ExpressionAttributeValues: {
        ':dataSourcePk': `DATASOURCE#${dataSource.id}`,
        ':tablePrefix': 'TABLE#',
      },
    };

    const conversationCommand = new QueryCommand(conversationParams);
    const datasetCommand = new QueryCommand(datasetParams);

    const [conversationData, datasetData] = await Promise.all([
      dynamodb.send(conversationCommand),
      dynamodb.send(datasetCommand),
    ]);

    const conversationHistory = (conversationData.Items || []).reverse(); // Reverse to get the oldest messages first
    const datasetItems = datasetData.Items || [];

    if (!datasetItems) {
      return res.status(404).json({ error: 'Dataset not found for the given threadId.' });
    }

    // Step 3: Construct AI Prompt Components

    const prompt = `
      You are a friendly AI data analyst dedicated to helping users understand and analyze their data based on the provided dataset structure.

      **Available Resources:**
      1. **Database Schema**: Tables, columns, and foreign keys.
      2. **SQL Execution**: Use \`query_database(query)\` to run SQL queries and retrieve data.
      3. **Visualization**: Generate charts by providing chart.js JSON configurations (type, data, options) where charts should appear (NOTE: the user sees the chart, NOT the JSON, so don't mention the JSON in your response).

      **Your Responsibilities:**
      1. **Understand the Request**: Carefully read the user's question, identify the necessary data, and ask clarifying questions if needed.
      2. **Retrieve Data**: Create and execute SQL queries using \`query_database(query)\` to obtain the required data.
      3. **Visualize Data**: When possible, provide JSON configurations for charts to present data visually without prompting (use charts more frequently than tables).
      4. **Include Insights on Data**: Provide insights on the data retrieved to help the user understand the data.
      5. **Present Clearly**: Use Markdown for readability (headings, bullet points, bold text) and proper formatting for equations (\$ for inline and \$\$ for block).
      
      **Visualization Guidelines:**
      - Correct Structure: Ensure that the JSON follows the expected format for Chart.js, including proper nesting.
      - No Trailing Commas: Ensure there are no trailing commas after the last item in an object or array.
      - Consistency in Keys: Make sure that all keys used in the configuration are valid and recognized by Chart.js.
      - Data Types: Ensure that the data types (e.g., numbers, strings) are correctly formatted.

      **SQL Execution Guidelines:**
      - The query must be a valid SQL query for the given dataset (either PostgreSQL or Snowflake).
      - Specifically, for Snowflake, be sure to use double quotes when necessary to ensure correct capitalization.
      `;

    // a. Define AI Role and Purpose
    const systemPrompt = {
      role: 'system',
      content: prompt,
    };

    // b. Format the Dataset Structure
    const dbType = getDatabaseType(dataSource.dataSourceType);
    const datasetDescription = {
      role: 'system',
      content: `Here is the structure of your dataset in ${dbType}:\n\n${formatDataset(datasetItems)}`,
    };

    // c. Prepare Past Conversation
    const openAIMessages = conversationHistory.map((msg) => ({
      role: msg.direction === 'sent' ? 'user' : 'assistant',
      content: msg.content,
    }));

    // Step 4: Trim Messages to Fit Token Limit
    const MAX_TOKENS = 10000; 
    let totalTokens = 0;
    const trimmedMessages = [];

    // Estimate tokens and trim if necessary
    for (let i = openAIMessages.length - 1; i >= 0; i--) {
      const message = openAIMessages[i];
      const messageTokens = Math.ceil(message.content.length / 4); // Rough estimate
      if (totalTokens + messageTokens > MAX_TOKENS) break;
      totalTokens += messageTokens;
      trimmedMessages.unshift(message);
    }

    // d. Append the Latest User Message
    trimmedMessages.push({
      role: 'user',
      content: message.content,
    });

    // Step 5: Combine All Parts into Final Messages
    const finalMessages = [systemPrompt, datasetDescription, ...trimmedMessages];

    const tools = [{
      type: "function",
      function: {
        name: "query_database",
        description: "Query the database structure that was provided to you for information. Call this whenever you need to know something about the data to answer the user's question.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The SQL query to run on the database.",
            },
          },
          required: ["query"],
          additionalProperties: false,
        },
      }
    }];

    // Step 6: Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: finalMessages,
      max_tokens: 10000,
      temperature: 0.3,
      tools: tools,
      tool_choice: 'auto',
    });

    const assistantResponse = response.choices[0].message;
    let assistantContent = assistantResponse.content ? assistantResponse.content.trim() : '';
    let messagesToSave = [];
    let finalAssistantResponse = assistantResponse;

    if (assistantResponse.tool_calls) {
      const toolResponses = []; // Array to hold tool responses
      for (const toolCall of assistantResponse.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        let toolResponse;

        if (toolName === 'query_database') {
          console.log("Tool args: ", toolArgs);
          toolResponse = await queryDatabase(toolArgs.query, dataSource);
        }

        console.log("Tool response: ", toolResponse);

        const toolMessage = {
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResponse),
        };

        toolResponses.push(toolMessage); // Store the tool message
      }

      finalMessages.push(assistantResponse);
      finalMessages.push(...toolResponses); // Append all tool responses to final messages
      console.log("Final messages: ", finalMessages);

      const secondResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: finalMessages,
        max_tokens: 10000,
        temperature: 0.3,
      });

      finalAssistantResponse = secondResponse.choices[0].message;
      assistantContent = finalAssistantResponse.content ? finalAssistantResponse.content.trim() : '';
      messagesToSave = [finalAssistantResponse];
    } else {
      messagesToSave = [assistantResponse];
    }

    // Step 7: Save Both Messages to DynamoDB
    const userMessageInstance = new Message({
      threadId,
      content: message.content,
      direction: 'sent',
      timestamp: message.timestamp || Date.now(),
    });
    const userMessageItem = userMessageInstance.toItem();

    // Prepare Batch Write
    const putRequests = [
      {
        PutRequest: {
          Item: userMessageItem,
        },
      },
    ];

    messagesToSave.forEach((message) => {
      const messageInstance = new Message({
        threadId,
        content: message.content || '',
        direction: 'received',
        timestamp: Date.now(),
      });
      const messageItem = messageInstance.toItem();

      putRequests.push({
        PutRequest: { Item: messageItem },
      });
    });

    const batchWriteParams = {
      RequestItems: {
        [tableName]: putRequests,
      },
    };

    const batchWriteCommand = new BatchWriteCommand(batchWriteParams);
    await dynamodb.send(batchWriteCommand);

    // Step 8: Respond to Client
    res.json({ assistantMessage: finalAssistantResponse });

  } catch (error) {
      if (error.response) {
        console.error('OpenAI API Error:', error.response.status, error.response.data);
        res.status(error.response.status).json(error.response.data);
      } else {
        console.error('Unexpected Error:', error);
        res.status(500).json({ error: 'An unexpected error occurred.' });
      }
  }
};

//////////////////////////////////////////////////////////////////////////////////////////
async function queryDatabase(query, dataSource) {
  switch (dataSource.dataSourceType) {
    case 'PostgreSQL':
      const client = new Client({
        host: dataSource.host,
        port: dataSource.port,
        user: dataSource.username,
        password: dataSource.password,
        database: dataSource.databaseName
      });

      try {
        await client.connect();
        console.log('Connected to the database successfully.');
        console.log("Query: ", query);
        const res = await client.query(query);
        console.log("Query result: ", res.rows);
        return res.rows;
      } catch (err) {
        console.error('Failed to connect to the database:', err.message);
        throw new Error(`Database connection error: ${err.message}`);
      }
    
    case 'Excel':
      const translatedQuery = translatePostgresToSnowflake(query);
      console.log("Translated query: ", translatedQuery);
      const snowflakeConnection = await connectToSnowflake_customer({databaseName: dataSource.databaseName, schemaName: dataSource.schemaName});
      const res = await executeQuery({connection: snowflakeConnection, query: translatedQuery});
      console.log("Query result: ", res);
      return res;
  }
}

function getDatabaseType(dataSourceType) {
  if (dataSourceType === 'PostgreSQL') {
    return 'PostgreSQL';
  } else if (dataSourceType === 'Excel') {
    return 'Snowflake';
  }
}

//////////////////////////////////////////////////////////////////////////////////////////
export const getThreadMessages = async (req, res) => {
  const { threadId } = req.params;

  const params = {
    TableName: tableName,
    KeyConditionExpression:
      'PK = :threadPk AND begins_with(SK, :messagePrefix)',
    ExpressionAttributeValues: {
      ':threadPk': `THREAD#${threadId}`,
      ':messagePrefix': 'MESSAGE#',
    },
    ScanIndexForward: true, // Sorts the results in ascending order
  };

  try {
    const command = new QueryCommand(params);
    const data = await dynamodb.send(command);
    const messages = data.Items.map((item) => Message.fromItem(item));
    res.status(200).json(messages);
  } catch (err) {
    console.error(
      'Unable to retrieve messages. Error JSON:',
      JSON.stringify(err, null, 2)
    );
    res
      .status(500)
      .json({ error: 'An error occurred while retrieving messages.' });
  }
};

//////////////////////////////////////////////////////////////////////////////////////////
export const editThreadTitle = async (req, res) => {
  const { userId, threadId, newTitle } = req.body;

  const params = {
    TableName: tableName,
    Key: {
      PK: `USER#${userId}`,
      SK: `THREAD#${threadId}`,
    },
    UpdateExpression: 'set #title = :newTitle',
    ExpressionAttributeNames: {
      '#title': 'title',
    },
    ExpressionAttributeValues: {
      ':newTitle': newTitle,
    },
    ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)', // Ensures the thread exists
  };

  try {
    const command = new UpdateCommand(params);
    await dynamodb.send(command);
    res.status(200).json({
      message: 'Thread title updated successfully.',
    });
  } catch (err) {
    console.error(
      'Unable to update thread title. Error JSON:',
      JSON.stringify(err, null, 2)
    );
    res
      .status(500)
      .json({ error: 'An error occurred while updating the thread title.' });
  }
};

//////////////////////////////////////////////////////////////////////////////////////////
export const deleteThread = async (req, res) => {
  const { userId, threadId } = req.params;

  try {
    // Step 1: Delete the thread item from the user's partition
    const deleteThreadParams = {
      TableName: tableName,
      Key: {
        PK: `USER#${userId}`,
        SK: `THREAD#${threadId}`,
      },
      ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)', // Ensures the thread exists
    };

    // Execute the delete command for the thread
    const deleteThreadCommand = new DeleteCommand(deleteThreadParams);
    await dynamodb.send(deleteThreadCommand);

    // Step 2: Query for all items under the thread's partition (messages and any metadata)
    const queryParams = {
      TableName: tableName,
      KeyConditionExpression: 'PK = :threadPk',
      ExpressionAttributeValues: {
        ':threadPk': `THREAD#${threadId}`,
      },
    };

    const queryCommand = new QueryCommand(queryParams);
    const queryResult = await dynamodb.send(queryCommand);

    const itemsToDelete = queryResult.Items;

    if (itemsToDelete.length > 0) {
      // Step 3: Prepare delete requests for messages and any other items under the thread
      const deleteRequests = itemsToDelete.map((item) => ({
        DeleteRequest: {
          Key: {
            PK: item.PK,
            SK: item.SK,
          },
        },
      }));

      // Step 4: Batch write to delete messages (max 25 items per batch)
      const batches = [];
      while (deleteRequests.length) {
        batches.push(deleteRequests.splice(0, 25));
      }

      // Step 5: Execute the batch deletes
      for (const batch of batches) {
        const batchWriteParams = {
          RequestItems: {
            [tableName]: batch,
          },
        };
        const batchWriteCommand = new BatchWriteCommand(batchWriteParams);
        await dynamodb.send(batchWriteCommand);
      }
    }

    res.status(200).json({
      message: 'Thread and associated messages deleted successfully.',
    });
  } catch (err) {
    console.error(
      'Unable to delete thread and messages. Error JSON:',
      JSON.stringify(err, null, 2)
    );
    res.status(500).json({
      error: 'An error occurred while deleting the thread and messages.',
    });
  }
};

//////////////////////////////////////////////////////////////////////////////////////////
export const updateThread = async (req, res) => {
  const { userId, threadId, dataSourceId } = req.body;

  const params = {
    TableName: tableName,
    Key: {
      PK: `USER#${userId}`,
      SK: `THREAD#${threadId}`,
    },
    UpdateExpression: 'set #dataSourceId = :dataSourceId',
    ExpressionAttributeNames: {
      '#dataSourceId': 'dataSourceId',
    },
    ExpressionAttributeValues: {
      ':dataSourceId': dataSourceId,
    },
    ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)', // Ensures the thread exists
    ReturnValues: 'ALL_NEW', // Return the updated item
  };

  try {
    const command = new UpdateCommand(params);
    const response = await dynamodb.send(command);
    const updatedItem = response.Attributes;
    res.status(200).json({
      message: 'Thread updated successfully.',
      thread: Thread.fromItem(updatedItem),
    });
  } catch (err) {
    console.error(
      'Unable to update thread. Error JSON:',
      JSON.stringify(err, null, 2)
    );
    res.status(500).json({
      error: 'An error occurred while updating the thread.',
    });
  }
};

export const getThread = async (req, res) => {
  const { userId, threadId } = req.params;

  const params = {
    TableName: tableName,
    Key: {
      PK: `USER#${userId}`,
      SK: `THREAD#${threadId}`,
    },
  };

  try {
    const command = new GetCommand(params);
    const response = await dynamodb.send(command);

    if (response.Item) {
      const thread = Thread.fromItem(response.Item);
      res.status(200).json(thread);
    } else {
      res.status(404).json({ error: 'Thread not found.' });
    }
  } catch (err) {
    console.error('Unable to retrieve thread. Error JSON:', JSON.stringify(err, null, 2));
    res.status(500).json({ error: 'An error occurred while retrieving the thread.' });
  }
};

