// threadsController.js

import dynamodb from '../config/dbConfig.js';
import shortUUID from "short-uuid";
import { PutCommand, QueryCommand, UpdateCommand, BatchWriteCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import Thread from '../objects/Thread.js';
import Message from '../objects/Message.js';

const tableName = 'vairo-table';

/**
 * Creates a new thread for a user.
 * Expects 'userId' and 'title' in the request body.
 */
export const createThread = async (req, res) => {
  const { id, userId, title } = req.body;

  // Create a new Thread instance
  const thread = new Thread({ id, userId, title });
  const item = thread.toItem();

  const params = {
    TableName: tableName,
    Item: item,
    ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)', // Prevents overwriting existing items
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

/**
 * Adds a message to a thread.
 * Expects 'threadId', 'content', and 'direction' in the request body.
 */
export const addMessageToThread = async (req, res) => {
  const { threadId, content, direction } = req.body;

  // Create a new Message instance
  const message = new Message({ threadId, content, direction });
  const item = message.toItem();

  const params = {
    TableName: tableName,
    Item: item,
    ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)', // Prevents overwriting existing items
  };

  try {
    const command = new PutCommand(params);
    await dynamodb.send(command);
    res.status(201).json({
      messageId: message.id,
      message: 'Message added successfully.',
    });
  } catch (err) {
    console.error(
      'Unable to add message. Error JSON:',
      JSON.stringify(err, null, 2)
    );
    res
      .status(500)
      .json({ error: 'An error occurred while adding the message.' });
  }
};

/**
 * Retrieves all messages in a thread.
 * Expects 'threadId' as a URL parameter.
 */
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

    // Map the items to Message instances
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

/**
 * Edits the title of a thread.
 * Expects 'threadId' and 'newTitle' in the request body.
 */
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

/**
 * Deletes a thread and all its underlying messages.
 * Expects 'userId' and 'threadId' as URL parameters.
 */
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


