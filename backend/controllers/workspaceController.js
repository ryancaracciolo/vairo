// UserController.js

import dynamodb from '../config/dbConfig.js';
import shortUUID from "short-uuid";
import { PutCommand, GetCommand, QueryCommand, TransactWriteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import Workspace from '../objects/Workspace.js';
import User from '../objects/User.js';
import { sendEmail } from './helpers/sendEmail.js';

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

export const updateWorkspaceName = async (req, res) => {
  const { id } = req.params;
  const { newName } = req.body;

  const updateParams = {
    TableName: tableName,
    Key: {
      PK: `WORKSPACE#${id}`,
      SK: 'METADATA',
    },
    UpdateExpression: 'set #name = :newName',
    ExpressionAttributeNames: {
      '#name': 'name',
    },
    ExpressionAttributeValues: {
      ':newName': newName,
    },
    ReturnValues: 'UPDATED_NEW',
  };

  try {
    const command = new UpdateCommand(updateParams);
    const result = await dynamodb.send(command);
    console.log('Updated workspace name:', JSON.stringify(result.Attributes, null, 2));
    res.status(200).json({ message: 'Workspace name updated successfully.', updatedAttributes: result.Attributes });
  } catch (err) {
    console.error('Unable to update workspace name. Error JSON:', JSON.stringify(err, null, 2));
    res.status(500).json({ error: 'An error occurred while updating the workspace name.' });
  }
};

export const updateWorkspaceSubscription = async (req, res) => {
  const { id } = req.params;
  const { newSubscriptionType } = req.body;

  const updateParams = {
    TableName: tableName,
    Key: {
      PK: `WORKSPACE#${id}`,
      SK: 'METADATA',
    },
    UpdateExpression: 'set #subscriptionType = :newSubscriptionType',
    ExpressionAttributeNames: {
      '#subscriptionType': 'subscriptionType',
    },
    ExpressionAttributeValues: {
      ':newSubscriptionType': newSubscriptionType,
    },
    ReturnValues: 'UPDATED_NEW',
  };

  try {
    const command = new UpdateCommand(updateParams);
    const result = await dynamodb.send(command);
    console.log('Updated workspace subscription type:', JSON.stringify(result.Attributes, null, 2));
    res.status(200).json({ message: 'Workspace subscription type updated successfully.', updatedAttributes: result.Attributes });
  } catch (err) {
    console.error('Unable to update workspace subscription type. Error JSON:', JSON.stringify(err, null, 2));
    res.status(500).json({ error: 'An error occurred while updating the workspace subscription type.' });
  }
};

export const inviteMembers = async (req, res) => {
  const { workspaceId, workspaceName, emails, senderName } = req.body;

  if (workspaceId === undefined || workspaceName === undefined || !emails || emails.length === 0) {
    return res.status(400).json({ error: 'Invalid request parameters.' });
  }

  try {
    for (const email of emails) {
      const inviteItemOne = {
        PK: `WORKSPACE#${workspaceId}`,
        SK: `INVITE#${email}`,
        email,
        workspaceId,
        workspaceName,
        senderName
      };

      const inviteItemTwo = {
        PK: `INVITE#${email}`,
        SK: `WORKSPACE#${workspaceId}`,
        email,
        workspaceId,
        workspaceName,
        senderName
      };

      const transactParams = {
        TransactItems: [
          {
            Put: {
              TableName: tableName,
              Item: inviteItemOne,
              ConditionExpression: 'attribute_not_exists(PK)', // Prevents overwriting existing items
            },
          },
          {
            Put: {
              TableName: tableName,
              Item: inviteItemTwo,
              ConditionExpression: 'attribute_not_exists(PK)', // Prevents overwriting existing items
            },
          },
        ],
      };

      try {
        const transactCommand = new TransactWriteCommand(transactParams);
        await dynamodb.send(transactCommand);

        // Send email only if the database operation is successful
        await sendEmail({
          toEmail: email,
          subject: `Invite to ${workspaceName}`,
          body: `${senderName} has invited you to join the workspace ${workspaceName} on Vairo.<br><br>
          Please click the link below to accept the invite and join the workspace:<br>
          <a href="${process.env.APP_URL}/login?workspaceId=${workspaceId}">Join Workspace</a>`
        });

        // Wait for 5 seconds before sending the next email
        if (emails.indexOf(email) < emails.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } catch (err) {
        console.error(`Failed to add invite for ${email}. Error:`, err);
        return res.status(500).json({ error: `An error occurred while processing the invite for ${email}.` });
      }
    }
    res.status(200).json({ message: 'Invitations sent successfully.' });
  } catch (err) {
    console.error('Unable to invite members. Error JSON:', JSON.stringify(err, null, 2));
    res.status(500).json({ error: 'An error occurred while inviting members.' });
  }
};


export const getInvitesSent = async (req, res) => {
  const { workspaceId } = req.params;

  const params = {
    TableName: tableName,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    ExpressionAttributeValues: {
      ':pk': `WORKSPACE#${workspaceId}`,
      ':skPrefix': 'INVITE#',
    },
  };

  try {
    const command = new QueryCommand(params);
    const data = await dynamodb.send(command);
    res.status(200).json(data.Items);
  } catch (err) {
    res.status(500).json({ error: 'An error occurred while retrieving the invites sent.' });
  }
};
