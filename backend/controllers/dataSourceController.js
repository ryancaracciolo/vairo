// DataSourceController.js

import dynamodb from '../config/dbConfig.js';
import shortUUID from "short-uuid";
import { PutCommand, GetCommand, TransactWriteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import DataSource from '../objects/DataSource.js';
import DataSourceAccess from '../objects/DataSourceAccess.js';
import Table from '../objects/Table.js';

const tableName = 'vairo-table';

export const addDataSource = async (req) => {
    const { id, creatorUserId, name, dataSourceType, createdAt, host, port, username, password, status, databaseName, schemaName } = req.body;
    
    let dataSourceId = id;
    if (dataSourceId === '' || dataSourceId === null || dataSourceId === undefined) {
        dataSourceId = shortUUID().new();
    }

    const dataSource = new DataSource({
      id: dataSourceId,
      creatorUserId: creatorUserId,
      name: name,
      dataSourceType: dataSourceType,
      createdAt: createdAt,
      host: host,
      port: port,
      username: username,
      password: password,
      databaseName: databaseName,
      schemaName: schemaName,
      status: status
    });
    const dataSourceItem = dataSource.toItem();
  
    // Create DataSourceAccess items for the creator under both User and DataSource partitions
    const dataSourceAccessUnderUser = new DataSourceAccess({
      userId: creatorUserId,
      dataSourceId: dataSourceId,
      accessLevel: 'owner',
      partitionType: 'USER',
    });
    const dataSourceAccessUnderUserItem = dataSourceAccessUnderUser.toItem();
  
    const dataSourceAccessUnderDataSource = new DataSourceAccess({
      userId: creatorUserId,
      dataSourceId: dataSourceId,
      accessLevel: 'owner',
      partitionType: 'DATASOURCE',
    });
    const dataSourceAccessUnderDataSourceItem = dataSourceAccessUnderDataSource.toItem();
  
    // Prepare the transactional write parameters
    const transactItems = [
      {
        Put: {
          TableName: tableName,
          Item: dataSourceItem,
          ConditionExpression: 'attribute_not_exists(PK)', // Ensure DataSource doesn't already exist
        },
      },
      {
        Put: {
          TableName: tableName,
          Item: dataSourceAccessUnderUserItem,
          ConditionExpression: 'attribute_not_exists(PK)', // Ensure no existing access item under User
        },
      },
      {
        Put: {
          TableName: tableName,
          Item: dataSourceAccessUnderDataSourceItem,
          ConditionExpression: 'attribute_not_exists(PK)', // Ensure no existing access item under DataSource
        },
      },
    ];

    console.log('Transact items:', JSON.stringify(transactItems, null, 2));
  
    try {
      const command = new TransactWriteCommand({
        TransactItems: transactItems,
      });
      await dynamodb.send(command);
      console.log(
        'Added data source and access entries:',
        JSON.stringify(
          {
            dataSourceItem,
            dataSourceAccessUnderUserItem,
            dataSourceAccessUnderDataSourceItem,
          },
          null,
          2
        )
      );
      return {
        success: true,
        dataSourceId: dataSourceId,
      };
    } catch (err) {
      console.error(
        'Unable to add data source. Error JSON:',
        JSON.stringify(err, Object.getOwnPropertyNames(err), 2)
      );
      return {
        success: false,
        error: 'An error occurred while adding the data source.',
      };
    }
};
  

export const getDataSourceById = async (req, res) => {
  const { id } = req.params;

  const params = {
    TableName: tableName,
    Key: {
      PK: `DATASOURCE#${id}`,
      SK: 'METADATA',
    },
  };

  try {
    const command = new GetCommand(params);
    const data = await dynamodb.send(command);
    if (data.Item) {
      const dataSource = DataSource.fromItem(data.Item);
      console.log(
        'Retrieved data source:',
        JSON.stringify(dataSource, null, 2)
      );
      res.status(200).json(dataSource.toItem());
    } else {
      res.status(404).json({ message: 'Data source not found.' });
    }
  } catch (err) {
    console.error(
      'Unable to retrieve data source. Error JSON:',
      JSON.stringify(err, null, 2)
    );
    res
      .status(500)
      .json({ error: 'An error occurred while retrieving the data source.' });
  }
};

export const removeDataSources = async (req, res) => {
    const { ids, userId } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'No data source IDs provided.' });
    }

    try {
        // Prepare transaction items
        const transactItems = [];

        for (const id of ids) {
            // Query for tables associated with the data source
            const tableQueryParams = {
                TableName: tableName,
                KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
                ExpressionAttributeValues: {
                    ':pk': `DATASOURCE#${id}`,
                    ':sk': 'TABLE#',
                },
            };

            const tableQueryCommand = new QueryCommand(tableQueryParams);
            const tableQueryResult = await dynamodb.send(tableQueryCommand);

            // Add delete operations for each table
            tableQueryResult.Items.forEach(tableItem => {
                transactItems.push({
                    Delete: {
                        TableName: tableName,
                        Key: {
                            PK: tableItem.PK,
                            SK: tableItem.SK,
                        },
                        ConditionExpression: 'attribute_exists(PK)', // Ensure the table exists
                    },
                });
            });

            // Add delete operations for the data source and access items
            transactItems.push(
                {
                    Delete: {
                        TableName: tableName,
                        Key: {
                            PK: `DATASOURCE#${id}`,
                            SK: 'METADATA',
                        },
                        ConditionExpression: 'attribute_exists(PK)', // Ensure the data source exists
                    },
                },
                {
                    Delete: {
                        TableName: tableName,
                        Key: {
                            PK: `DATASOURCE#${id}`,
                            SK: `USER#${userId}`,
                        },
                        ConditionExpression: 'attribute_exists(PK)', // Ensure the access item exists
                    },
                },
                {
                    Delete: {
                        TableName: tableName,
                        Key: {
                            PK: `USER#${userId}`,
                            SK: `DATASOURCE#${id}`,
                        },
                        ConditionExpression: 'attribute_exists(PK)', // Ensure the access item exists
                    },
                }
            );
        }

        // Execute the transaction
        const command = new TransactWriteCommand({
            TransactItems: transactItems,
        });
        await dynamodb.send(command);
        console.log('Deleted data sources, tables, and associated access objects:', ids);
        res.status(200).json({ success: true, deletedIds: ids });
    } catch (err) {
        console.error(
            'Unable to delete data sources, tables, and access objects. Error JSON:',
            JSON.stringify(err, Object.getOwnPropertyNames(err), 2)
        );
        res.status(500).json({ error: 'An error occurred while deleting the data sources, tables, and access objects.' });
    }
};

export const addSchema = async (req, res) => {
  const { dataSourceId, tables } = req.body; // 'tables' is expected to be an object with table definitions

  // Check if tables is an object
  if (typeof tables !== 'object' || tables === null) {
    const errorResponse = { error: 'Invalid input: tables should be an object.' };
    if (res) {
      return res.status(400).json(errorResponse);
    }
    return errorResponse;
  }

  try {
    // Prepare transaction items
    const transactItems = [];

    // Add tables to transaction items
    for (const tn in tables) {
      if (tables.hasOwnProperty(tn)) {
        const tableData = tables[tn];
        const table = new Table({
          dataSourceId,
          content: tableData
        });

        const item = table.toItem();

        transactItems.push({
          Put: {
            TableName: tableName,
            Item: item,
            ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
          },
        });
      }
    }

    // Add update for DataSource status to "connected"
    transactItems.push({
      Update: {
        TableName: tableName,
        Key: {
          PK: `DATASOURCE#${dataSourceId}`,
          SK: 'METADATA',
        },
        UpdateExpression: 'SET #status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': 'connected',
        },
        ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)', // Ensure the DataSource exists
      },
    });

    // DynamoDB allows a maximum of 25 items per transaction
    const chunkSize = 25;
    for (let i = 0; i < transactItems.length; i += chunkSize) {
      const chunk = transactItems.slice(i, i + chunkSize);

      const params = {
        TransactItems: chunk,
      };

      const command = new TransactWriteCommand(params);
      await dynamodb.send(command);
    }

    const successResponse = { message: 'Tables added successfully and DataSource status updated to connected.' };
    if (res) {
      return res.status(200).json(successResponse);
    }
    return successResponse;
  } catch (err) {
    console.error('Unable to add Tables or update DataSource status. Error:', err);
    const errorResponse = { error: 'An error occurred while adding the Tables or updating the DataSource status.' };
    if (res) {
      return res.status(500).json(errorResponse);
    }
    return errorResponse;
  }
};

export const getDataSourceAccess = async (req, res) => {
  const { id } = req.params;

  const params = {
    TableName: tableName,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    ExpressionAttributeValues: {
      ':pk': `DATASOURCE#${id}`,
      ':skPrefix': 'USER#',
    },
  };

  try {
    const command = new QueryCommand(params);
    const data = await dynamodb.send(command);

    if (data.Items && data.Items.length > 0) {
      // Retrieve user names for each access item
      const accessItemsWithNames = await Promise.all(data.Items.map(async (accessItem) => {
        const userParams = {
          TableName: tableName,
          Key: {
            PK: `USER#${accessItem.userId}`,
            SK: 'METADATA',
          },
          ProjectionExpression: '#name', // Use expression attribute name
          ExpressionAttributeNames: {
            '#name': 'name', // Map the reserved keyword
          },
        };

        const userCommand = new GetCommand(userParams);
        const userData = await dynamodb.send(userCommand);

        return {
          dataSourceId: accessItem.dataSourceId,
          userId: accessItem.userId,
          name: userData.Item ? userData.Item.name : 'Unknown',
        };
      }));

      console.log(
        'Retrieved data source access items with user names:',
        JSON.stringify(accessItemsWithNames, null, 2)
      );
      res.status(200).json(accessItemsWithNames);
    } else {
      res.status(404).json({ message: 'No access items found for this data source.' });
    }
  } catch (err) {
    console.error(
      'Unable to retrieve data source access items. Error JSON:',
      JSON.stringify(err, null, 2)
    );
    res
      .status(500)
      .json({ error: 'An error occurred while retrieving the data source access items.' });
  }
};
