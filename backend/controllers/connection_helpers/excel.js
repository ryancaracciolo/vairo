import shortUUID from 'short-uuid';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import csv from 'fast-csv';
import { addDataSource, addSchema } from '../dataSourceController.js';
import { connectToSnowflake_general, createDatabaseIfNotExists, createSchemaIfNotExists, addCSVToSnowflake } from '../snowflakeController.js';


export const handleExcel = async (req, res) => {
  const { creatorUserId, workspaceId, data } = req.body;
  const parsedData = JSON.parse(data);
  const { connectionName } = parsedData;
  const file = req.file;

  try {
    if (!file) {
      throw new Error('No file uploaded.');
    }

    // Initialize file variables
    const excelFilePath = file.path;
    const csvFilePath = await convertExcelToCSV(excelFilePath);
    const csvHeaders = await getCsvHeaders(csvFilePath);
    const tableName = getTableName(csvFilePath);

    // Create dataSourceId, databaseName, and schemaName
    const dataSourceId = shortUUID().new();
    const databaseName = `customer_${workspaceId}`;
    const schemaName = `schema_${dataSourceId}`;

    // Step 1: Create the dataSource object using addDataSource 
    const input = {body: {id: dataSourceId, creatorUserId: creatorUserId, name: connectionName, dataSourceType: 'Excel', databaseName: databaseName, schemaName: schemaName, status: 'pending'}};
    await addDataSource(input);

    // Connect to Snowflake
    const snowflakeConnection = await connectToSnowflake_general();

    // Create database and schema
    await createDatabaseIfNotExists({connection: snowflakeConnection, databaseName: databaseName});
    await createSchemaIfNotExists({connection: snowflakeConnection, databaseName: databaseName, schemaName: schemaName});

    // Add the CSV file to the Snowflake database
    await addCSVToSnowflake({connection: snowflakeConnection, databaseName: databaseName, schemaName: schemaName, csvFilePath: csvFilePath, csvHeaders: csvHeaders, tableName: tableName});

    // Add tables to the dataSource in dynamoDB
    const tableStructure = await getTableStructure(csvFilePath, csvHeaders);
    const schemaInput = {body: {dataSourceId: dataSourceId, tables: tableStructure}};
    await addSchema(schemaInput);

     // Clean up local files
     fs.unlinkSync(excelFilePath);
     fs.unlinkSync(csvFilePath);

    res.status(200).send({message: 'File uploaded and processed successfully.', dataSourceId: dataSourceId, dbStructure: tableStructure});
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

// Helper: Extract headers from a CSV file
function getCsvHeaders(csvFilePath) {
  return new Promise((resolve, reject) => {
    // Use fast-csv's "headers: true" configuration to extract headers automatically
    fs.createReadStream(csvFilePath)
      .pipe(csv.parse({ headers: true }))
      .on('headers', (headerList) => {
        resolve(headerList); // Resolve with the headers
      })
      .on('error', (err) => {
        reject(err); // Reject on error
      })
      .on('end', () => {
      });
  });
}

function getTableName(csvFilePath) {
  const fileName = path.basename(csvFilePath, '.csv'); // Extract base name without extension
  const tableName = fileName.substring(fileName.indexOf('_') + 1); // Remove text before the first underscore
  return tableName;
}

// Helper function to create table metadata from CSV
async function getTableStructure(csvFilePath, csvHeaders) {
  const tableName = getTableName(csvFilePath);
  const columns = csvHeaders.map(header => ({ name: header, type: 'string' }));
  const tableData = {
    [tableName]: {
      tableName: tableName,
      description: null,
      columns,
      foreignKeys: []
    }
  };
  console.log("tableData: ", tableData);
  return tableData;
}


