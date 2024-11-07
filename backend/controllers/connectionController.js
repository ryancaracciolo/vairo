// DataSourceController.js

import dynamodb from '../config/dbConfig.js';
import shortUUID from "short-uuid";
import { PutCommand, GetCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import DataSource from '../objects/DataSource.js';
import DataSourceAccess from '../objects/DataSourceAccess.js';
import Table from '../objects/Table.js';
import pkg from 'pg';

const { Client } = pkg;

const tableName = 'vairo-table'; // Replace with your actual DynamoDB table name

// Existing addTables function remains unchanged
export const addTables = async (req, res) => {
  const { dataSourceId, tables } = req.body; // 'tables' is an array of table data including columns and foreign keys

  try {
    // Prepare transaction items
    const transactItems = [];

    for (const tableData of tables) {
      const table = new Table({
        dataSourceId,
        content: tableData
      });

      console.log("table ", table);
      const item = table.toItem();
      console.log("tableItem ", item);


      transactItems.push({
        Put: {
          TableName: tableName,
          Item: item,
          ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
        },
      });
    }

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

    res.status(201).json({ message: 'Tables added successfully.' });
  } catch (err) {
    console.error('Unable to add Tables. Error:', err);
    res.status(500).json({ error: 'An error occurred while adding the Tables.' });
  }
};

///////////////////////////////////////////////////////////////
export const scrapeDatabase = async (req, res) => {
  const { dbConfig } = req.body;

  const client = await connectToDatabase(dbConfig);

  try {
    const tables = await getTables(client);
    const dbStructure = {};

    for (const tableName of tables) {
      const columns = await getColumns(client, tableName);
      const primaryKeys = await getPrimaryKeys(client, tableName);
      const foreignKeys = await getForeignKeys(client, tableName);

      // Transform columns to include 'primaryKey' boolean
      const transformedColumns = columns.map(col => ({
        name: col.column_name,
        type: col.data_type,
        primaryKey: primaryKeys.includes(col.column_name),
      }));

      // Transform foreignKeys to match the expected format
      const transformedForeignKeys = foreignKeys.map(fk => ({
        name: fk.constraint_name,
        column: fk.column_name,
        foreignTable: fk.foreign_table_name,
        foreignColumn: fk.foreign_column_name,
      }));

      dbStructure[tableName] = {
        tableName, // Including tableName for clarity (optional)
        description: null, // You can generate descriptions later using LLM or other methods
        columns: transformedColumns,
        foreignKeys: transformedForeignKeys,
      };
    }

    res.status(200).json(dbStructure);
  } catch (err) {
    console.error('Error retrieving database structure:', err);
    res.status(500).json({ error: 'Error retrieving database structure' });
    throw err;
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
};

async function connectToDatabase(dbConfig) {
  const client = new Client({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database
  });

  try {
    await client.connect();
    console.log('Connected to the database successfully.');
    return client;
  } catch (err) {
    console.error('Failed to connect to the database:', err.message);
    throw new Error(`Database connection error: ${err.message}`);
  }
}

async function getTables(client) {
  const query = `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE';
  `;

  const res = await client.query(query);
  const tables = res.rows.map(row => row.table_name.toLowerCase());
  return tables;
}

async function getColumns(client, tableName) {
  const query = `
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = $1
      AND table_schema = 'public';
  `;

  const res = await client.query(query, [tableName]);
  return res.rows; // Array of columns with details
}

async function getPrimaryKeys(client, tableName) {
  const query = `
    SELECT
      a.attname AS column_name
    FROM
      pg_index i
    JOIN
      pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
    WHERE
      i.indrelid = $1::regclass
      AND i.indisprimary;
  `;

  const res = await client.query(query, [tableName]);
  return res.rows.map(row => row.column_name);
}

async function getForeignKeys(client, tableName) {
  const query = `
    SELECT
      conname AS constraint_name,
      att2.attname AS column_name,
      cl.relname AS foreign_table_name,
      att.attname AS foreign_column_name
    FROM
      (SELECT
         unnest(con1.conkey) AS parent,
         unnest(con1.confkey) AS child,
         con1.confrelid,
         con1.conname
       FROM
         pg_class AS cl
       JOIN pg_namespace AS ns ON cl.relnamespace = ns.oid
       JOIN pg_constraint AS con1 ON con1.conrelid = cl.oid
       WHERE
         cl.relname = $1
         AND con1.contype = 'f'
      ) AS con_info
    JOIN pg_attribute AS att ON
      att.attnum = con_info.child
      AND att.attrelid = con_info.confrelid
    JOIN pg_class AS cl ON
      cl.oid = con_info.confrelid
    JOIN pg_attribute AS att2 ON
      att2.attnum = con_info.parent
      AND att2.attrelid = (SELECT oid FROM pg_class WHERE relname = $1)
  `;

  const res = await client.query(query, [tableName]);
  return res.rows.map(row => ({
    constraint_name: row.constraint_name,
    column_name: row.column_name,
    foreign_table_name: row.foreign_table_name,
    foreign_column_name: row.foreign_column_name,
  }));
}
