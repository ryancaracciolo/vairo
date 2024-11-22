import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../../config/dbConfig.js';
import { addDataSource } from '../dataSourceController.js';
import { createSource_S3, createDest_snowflake, createConnection, triggerSync, getSource_byId } from '../airbyteController.js';
import { connectToSnowflake_general, createDatabaseIfNotExists, createSchemaIfNotExists } from '../snowflakeController.js';


export const handleExcel = async (req, res) => {
  const { creatorUserId, workspaceId, data } = req.body;
  const parsedData = JSON.parse(data);
  const { connectionName } = parsedData;
  const file = req.file;

  try {
    if (!file) {
      throw new Error('No file uploaded.');
    }

    const excelFilePath = file.path;

    // Convert Excel to CSV
    const csvFilePath = await convertExcelToCSV(excelFilePath);

    // Upload CSV to S3
    const s3Key = `${path.basename(csvFilePath)}`;
    await uploadFileToS3(csvFilePath, s3Key);

    // Clean up local files
    fs.unlinkSync(excelFilePath);
    fs.unlinkSync(csvFilePath);

    // Step 1: Create the dataSource object using addDataSource 
    const input = {body: {creatorUserId: creatorUserId, name: connectionName, dataSourceType: 'Excel', host: process.env.SNOWFLAKE_HOST, port: process.env.SNOWFLAKE_PORT, username: process.env.SNOWFLAKE_USERNAME, password: process.env.SNOWFLAKE_PASSWORD, databaseName: workspaceId}};
    const dataSource = await addDataSource(input);
    const dataSourceId = dataSource.dataSourceId;

    // Step 2: Create a Snowflake database for the user's workspace
    const sourceName = `source_${dataSourceId}`;
    const destName = `dest_${workspaceId}_${dataSourceId}`;
    const databaseName = `customer_${workspaceId}`;
    const schemaName = `schema_${dataSourceId}`;
    const connName = `${dataSourceId}_${workspaceId}`;

    // Connect to Snowflake
    const snowflakeConnection = await connectToSnowflake_general();

    // Create database and schema
    await createDatabaseIfNotExists({connection: snowflakeConnection, databaseName});
    await createSchemaIfNotExists({connection: snowflakeConnection, databaseName: databaseName, schemaName: schemaName});

    // Step 4: Create an Airbyte source to the S3 bucket
    const airbyteSource = await createSource_S3({sourceName: sourceName, datasetName: s3Key});
    const sourceId = airbyteSource.sourceId;

    const source = await getSource_byId({sourceId: sourceId});
    console.log("Source: ", source);

    // Step 5: Create an Airbyte destination to the Snowflake database
    const airbyteDestination = await createDest_snowflake({destName: destName, databaseName: databaseName, schemaName: schemaName});
    const destinationId = airbyteDestination.destinationId;

    // Step 6: Create a connection between the source and destination
    const connection = await createConnection({connectionName: connName, sourceId: sourceId, destinationId: destinationId, schemaName: schemaName});
    console.log("Connection Created: ", connection);
    const connectionId = connection.connectionId;
    
    // Step 7: Execute an Airbyte sync
    await triggerSync({connectionId: connectionId});
    console.log("Sync Triggered: ", connectionId);

    res.status(200).send({message: 'File uploaded and processed successfully.', dataSourceId: dataSourceId, connectionId: connectionId});
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).send({message: 'An error occurred while processing the file.', error: error});
  }
};

// Helper function to convert Excel to CSV
async function convertExcelToCSV(excelFilePath) {
  if (path.extname(excelFilePath).toLowerCase() === '.xlsx' || path.extname(excelFilePath).toLowerCase() === '.xls') {
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const csvData = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);

    const csvFilePath = excelFilePath.replace(path.extname(excelFilePath), '.csv');
    fs.writeFileSync(csvFilePath, csvData);

    return csvFilePath;
  } else {
    return excelFilePath;
  }
}

// Helper function to upload file to S3
async function uploadFileToS3(filePath, key) {
  const fileContent = fs.readFileSync(filePath);

  const uploadParams = {
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: fileContent,
  };

  const command = new PutObjectCommand(uploadParams);
  await s3Client.send(command);
}