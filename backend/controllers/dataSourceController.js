// DataSourceController.js

import dynamodb from '../config/dbConfig.js';
import shortUUID from "short-uuid";
import { PutCommand, GetCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import DataSource from '../objects/DataSource.js';
import DataSourceAccess from '../objects/DataSourceAccess.js';

const tableName = 'vairo-table';

export const addDataSource = async (req, res) => {
    const { creatorUserId, name, dataSourceType, createdAt, host, port, username, password } = req.body;
  
    const dataSourceId = shortUUID().new();
  
    const dataSource = new DataSource({
      id: dataSourceId,
      creatorUserId,
      name,
      dataSourceType,
      createdAt,
      host,
      port,
      username,
      password,
    });
    const dataSourceItem = dataSource.toItem();
  
    // Create DataSourceAccess items for the creator under both User and DataSource partitions
    const dataSourceAccessUnderUser = new DataSourceAccess({
      userId: creatorUserId,
      dataSourceId,
      accessLevel: 'owner',
      partitionType: 'USER',
    });
    const dataSourceAccessUnderUserItem = dataSourceAccessUnderUser.toItem();
  
    const dataSourceAccessUnderDataSource = new DataSourceAccess({
      userId: creatorUserId,
      dataSourceId,
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
      res.status(201).json({
        message: 'Data source added successfully.',
        dataSourceId,
      });
    } catch (err) {
      console.error(
        'Unable to add data source. Error JSON:',
        JSON.stringify(err, Object.getOwnPropertyNames(err), 2)
      );
      res
        .status(500)
        .json({ error: 'An error occurred while adding the data source.' });
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
