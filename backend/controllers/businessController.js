import dynamodb from '../config/dbConfig.js';
import shortUUID from "short-uuid";
import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import Business from '../objects/Business.js';

const tableName = 'vairo-table';

export const addBusiness = async (req, res) => {
  const { name } = req.body;

  const business = new Business(shortUUID().new(), name);
  const item = business.toItem();

  const params = {
    TableName: tableName, // Replace with your actual table name
    Item: item,
    ConditionExpression: 'attribute_not_exists(PK)', // Prevents overwriting existing items
  };

  try {
    const command = new PutCommand(params);
    await dynamodb.send(command);
    console.log('Added business:', JSON.stringify(item, null, 2));
    res.status(201).json({ message: 'Business added successfully.' });
  } catch (err) {
    console.error('Unable to add business. Error JSON:', JSON.stringify(err, null, 2));
    res.status(500).json({ error: 'An error occurred while adding the business.' });
  }
};

export const getBusinessById = async (req, res) => {
  const { id } = req.params;

  const params = {
    TableName: tableName,
    Key: {
      PK: `BUSINESS#${id}`,
      SK: 'METADATA',
    },
  };

  try {
    const command = new GetCommand(params);
    const data = await dynamodb.send(command);
    if (data.Item) {
      const business = Business.fromItem(data.Item);
      console.log('Retrieved business:', JSON.stringify(business, null, 2));
      res.status(200).json(business.toItem());
    } else {
      res.status(404).json({ message: 'Business not found.' });
    }
  } catch (err) {
    console.error('Unable to retrieve business. Error JSON:', JSON.stringify(err, null, 2));
    res.status(500).json({ error: 'An error occurred while retrieving the business.' });
  }
};


