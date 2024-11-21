// UserController.js

import dynamodb from '../config/dbConfig.js';
import shortUUID from "short-uuid";
import { PutCommand, GetCommand, QueryCommand, BatchGetCommand } from '@aws-sdk/lib-dynamodb';
import User from '../objects/User.js';
import Thread from '../objects/Thread.js';

const tableName = 'vairo-table';

export const addUser = async (req, res) => {
  const { name, email, workspaceId, role } = req.body;

  const user = new User({ id: shortUUID().new(), name, email, workspaceId, role });
  const item = user.toItem();

  const params = {
    TableName: tableName,
    Item: item,
    ConditionExpression: 'attribute_not_exists(PK)', // Prevents overwriting existing items
  };

  try {
    const command = new PutCommand(params);
    await dynamodb.send(command);
    console.log('Added user:', JSON.stringify(item, null, 2));
    res.status(201).json({ message: 'User added successfully.' });
  } catch (err) {
    console.error('Unable to add user. Error JSON:', JSON.stringify(err, null, 2));
    res.status(500).json({ error: 'An error occurred while adding the user.' });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;

  const params = {
    TableName: tableName,
    Key: {
      PK: `USER#${id}`,
      SK: `METADATA`,
    },
  };

  try {
    const command = new GetCommand(params);
    const data = await dynamodb.send(command);
    if (data.Item) {
      const user = User.fromItem(data.Item);
      console.log('Retrieved user:', JSON.stringify(user, null, 2));
      res.status(200).json(user.toItem());
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (err) {
    console.error('Unable to retrieve user. Error JSON:', JSON.stringify(err, null, 2));
    res.status(500).json({ error: 'An error occurred while retrieving the user.' });
  }
};

export const getUserByEmail = async (req, res) => {
  const { email } = req.params;

  const params = {
    TableName: tableName,
    IndexName: 'email-index', // Replace with your GSI name
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email,
    },
  };

  try {
    const command = new QueryCommand(params);
    const data = await dynamodb.send(command);
    if (data.Items && data.Items.length > 0) {
      console.log('Found user(s):', JSON.stringify(data.Items, null, 2));
      res.status(200).json(data.Items);
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (err) {
    console.error('Unable to find user by email. Error JSON:', JSON.stringify(err, null, 2));
    res.status(500).json({ error: 'An error occurred while finding the user by email.' });
  }
};


export const getDataSources = async (req, res) => {
  const { id } = req.params; // User ID

  try {
    // Step 1: Query DataSourceAccess items under the user's partition
    const params = {
      TableName: tableName,
      KeyConditionExpression: 'PK = :userPk AND begins_with(SK, :dataSourcePrefix)',
      ExpressionAttributeValues: {
        ':userPk': `USER#${id}`,
        ':dataSourcePrefix': 'DATASOURCE#',
      },
    };

    const command = new QueryCommand(params);
    const data = await dynamodb.send(command);
    const dataSourceAccessItems = data.Items;

    if (!dataSourceAccessItems || dataSourceAccessItems.length === 0) {
      res.status(200).json([]); // No data sources found
      return;
    }

    // Step 2: Extract DataSourceIDs
    const dataSourceIds = dataSourceAccessItems.map(item => item.dataSourceId);

    // Step 3: Prepare keys for BatchGetItem
    const keys = dataSourceIds.map(dataSourceId => ({
      PK: `DATASOURCE#${dataSourceId}`,
      SK: 'METADATA',
    }));

    // DynamoDB BatchGetItem allows a maximum of 100 items per request
    const batches = [];
    while (keys.length) {
      batches.push(keys.splice(0, 100));
    }

    // Step 4: Batch get DataSource items
    const dataSources = [];
    for (const batch of batches) {
      const batchGetParams = {
        RequestItems: {
          [tableName]: {
            Keys: batch,
          },
        },
      };
      const batchGetCommand = new BatchGetCommand(batchGetParams);
      const batchGetResult = await dynamodb.send(batchGetCommand);
      const batchDataSources = batchGetResult.Responses[tableName];
      dataSources.push(...batchDataSources);
    }

    res.status(200).json(dataSources);
  } catch (err) {
    console.error('Error retrieving user data sources. Error JSON:', JSON.stringify(err, null, 2));
    res.status(500).json({ error: 'An error occurred while retrieving user data sources.' });
  }
};


export const getUserThreads = async (req, res) => {
  const { userId } = req.params;
  console.log(userId);
  const params = {
    TableName: tableName,
    KeyConditionExpression: 'PK = :userPk AND begins_with(SK, :threadPrefix)',
    ExpressionAttributeValues: {
      ':userPk': `USER#${userId}`,
      ':threadPrefix': 'THREAD#',
    },
    ScanIndexForward: true, // Sorts the results in ascending order
  };

  try {
    const command = new QueryCommand(params);
    const data = await dynamodb.send(command);

    // Map the items to Thread instances
    const threads = data.Items.map((item) => Thread.fromItem(item));

    res.status(200).json(threads);
  } catch (err) {
    console.error('Unable to retrieve threads. Error JSON:', JSON.stringify(err, null, 2));
    res.status(500).json({ error: 'An error occurred while retrieving threads.' });
  }
};