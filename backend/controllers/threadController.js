import dynamodb from '../config/dbConfig.js';
import openai from '../config/openaiClient.js';
import shortUUID from "short-uuid";
import { PutCommand, QueryCommand, UpdateCommand, BatchWriteCommand, DeleteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import Thread from '../objects/Thread.js';
import Message from '../objects/Message.js';

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
  const { threadId, dataSourceId, message } = req.body;

  if (!threadId || !dataSourceId || !message || !message.content) {
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
        ':dataSourcePk': `DATASOURCE#${dataSourceId}`,
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
    // a. Define AI Role and Purpose
    const systemPrompt = {
      role: 'system',
      content: `You are an AI data analyst. Your goal is to help the user understand and analyze their data based on the provided dataset structure and past conversations.`,
    };

    // b. Format the Dataset Structure
    // Example: Presenting tables and columns in a readable format
    const datasetDescription = {
      role: 'system',
      content: `Here is the structure of your dataset:\n\n${formatDataset(datasetItems)}`,
    };

    // c. Prepare Past Conversation
    const openAIMessages = conversationHistory.map((msg) => ({
      role: msg.direction === 'sent' ? 'user' : 'assistant',
      content: msg.content,
    }));

    // Step 4: Trim Messages to Fit Token Limit
    const MAX_TOKENS = 3000; 
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

    console.log(datasetDescription);

    // Step 6: Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: finalMessages,
      max_tokens: 2000, // Adjust based on needs
      temperature: 0.3, // Adjust creativity
    });

    const assistantContent = response.choices[0].message.content.trim();

    // Step 7: Save Both Messages to DynamoDB
    // Create Message instances
    const assistantMessage = new Message({
      threadId,
      content: assistantContent,
      direction: 'received',
      timestamp: Date.now(),
    });
    const assistantMessageItem = assistantMessage.toItem();

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
      {
        PutRequest: {
          Item: assistantMessageItem,
        },
      },
    ];

    const batchWriteParams = {
      RequestItems: {
        [tableName]: putRequests,
      },
    };

    const batchWriteCommand = new BatchWriteCommand(batchWriteParams);
    await dynamodb.send(batchWriteCommand);

    // Step 8: Respond to Client
    res.json({ assistantMessage: assistantMessage });

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

