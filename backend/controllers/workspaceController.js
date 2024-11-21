// UserController.js

import dynamodb from '../config/dbConfig.js';
import shortUUID from "short-uuid";
import { PutCommand, GetCommand, QueryCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import Workspace from '../objects/Workspace.js';
import User from '../objects/User.js';

const tableName = 'vairo-table';

export const addWorkspace = async (req, res) => {
  const { name, adminName, adminEmail, adminRole, subscriptionType, domain } = req.body;

  const adminId = shortUUID().new();
  const workspaceId = shortUUID().new();
  const memberIds = [adminId];

  const user = new User({ id: adminId, email: adminEmail, name: adminName, role: adminRole, workspaceId: workspaceId });
  const userItem = user.toItem();

  console.log(workspaceId);

  const workspace = new Workspace({ id: workspaceId, name: name, adminId: adminId, subscriptionType: subscriptionType, domain: domain, memberIds: memberIds });
  const workspaceItem = workspace.toItem();

  const transactParams = {
    TransactItems: [
      {
        Put: {
          TableName: tableName,
          Item: workspaceItem,
          ConditionExpression: 'attribute_not_exists(PK)', // Prevents overwriting existing items
        },
      },
      {
        Put: {
          TableName: tableName,
          Item: userItem,
          ConditionExpression: 'attribute_not_exists(PK)', // Prevents overwriting existing items
        },
      },
    ],
  };

  try {
    const command = new TransactWriteCommand(transactParams);
    await dynamodb.send(command);
    console.log('Added workspace and user transactionally:', JSON.stringify({ workspaceItem, userItem }, null, 2));
    res.status(201).json({ message: 'Workspace and user added successfully.' });
  } catch (err) {
    console.error('Unable to add workspace and user transactionally. Error JSON:', JSON.stringify(err, null, 2));
    res.status(500).json({ error: 'An error occurred while adding the workspace and user.' });
  }
};

export const getWorkspaceById = async (req, res) => {
  const { id } = req.params;

  const params = {
    TableName: tableName,
    Key: {
      PK: `WORKSPACE#${id}`,
      SK: `METADATA`,
    },
  };

  try {
    const command = new GetCommand(params);
    const data = await dynamodb.send(command);
    if (data.Item) {
      console.log(data.Item)
      const workspace = Workspace.fromItem(data.Item);
      console.log('Retrieved workspace:', JSON.stringify(workspace, null, 2));
      res.status(200).json(workspace.toItem());
    } else {
      res.status(404).json({ message: 'Workspace not found.' });
    }
  } catch (err) {
    console.error('Unable to retrieve workspace. Error JSON:', JSON.stringify(err, null, 2));
    res.status(500).json({ error: 'An error occurred while retrieving the workspace.' });
  }
};

export const getWorkspaceByDomain = async (req, res) => {
  const { domain } = req.params;

  const params = {
    TableName: tableName,
    IndexName: 'domain-index', // Ensure this matches your GSI name
    KeyConditionExpression: '#d = :domain',
    ExpressionAttributeNames: {
      '#d': 'domain', // Use a placeholder for the reserved keyword
    },
    ExpressionAttributeValues: {
      ':domain': domain,
    },
  };

  try {
    const command = new QueryCommand(params);
    const data = await dynamodb.send(command);
    if (data.Items && data.Items.length > 0) {
      const workspaces = data.Items.map(item => Workspace.fromItem(item));
      console.log('Retrieved workspaces:', JSON.stringify(workspaces, null, 2));
      res.status(200).json(workspaces.map(ws => ws.toItem()));
    } else {
      res.status(202).json({ exists: false });
    }
  } catch (err) {
    console.error('Unable to retrieve workspaces. Error JSON:', JSON.stringify(err, null, 2));
    res.status(500).json({ error: 'An error occurred while retrieving the workspaces.' });
  }
};