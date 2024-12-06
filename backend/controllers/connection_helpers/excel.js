import shortUUID from 'short-uuid';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import csv from 'fast-csv';
import { addDataSource } from '../dataSourceController.js';
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

    const tableStructure = await getTableStructure(csvFilePath, csvHeaders);

    // Add the CSV file to the Snowflake database
    await addCSVToSnowflake({connection: snowflakeConnection, databaseName: databaseName, schemaName: schemaName, csvFilePath: csvFilePath, csvHeaders: csvHeaders, tableStructure: tableStructure, tableName: tableName});


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
  const ext = path.extname(excelFilePath).toLowerCase();
  if (ext === '.xlsx' || ext === '.xls') {
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const rawCsvData = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);

    const cleanedCsvData = await removeCommasFromNumericFields(rawCsvData);

    const csvFilePath = excelFilePath.replace(ext, '.csv');
    fs.writeFileSync(csvFilePath, cleanedCsvData);

    return csvFilePath;
  } else {
    return excelFilePath;
  }
}

// Helper function to remove commas from numeric fields in a CSV string
function removeCommasFromNumericFields(csvData) {
  return new Promise((resolve, reject) => {
    const rows = [];
    csv.parseString(csvData, { headers: false })
      .on('error', (error) => reject(error))
      .on('data', (row) => {
        const cleanedRow = row.map((field) => {
          const trimmedField = field.trim();
          // Regex to match a numeric value possibly containing commas:
          // ^\d{1,3}(\,\d{3})*(\.\d+)?$ will match numbers like "1,234", "12,345,678.90", etc.
          if (/^\d{1,3}(\,\d{3})*(\.\d+)?$/.test(trimmedField)) {
            return trimmedField.replace(/,/g, '');
          }
          return trimmedField;
        });
        rows.push(cleanedRow);
      })
      .on('end', () => {
        // Re-stringify the parsed rows back into CSV
        const csvStream = csv.format({ headers: false });
        let result = '';
        csvStream
          .on('data', chunk => { result += chunk.toString(); })
          .on('end', () => resolve(result));

        rows.forEach(row => csvStream.write(row));
        csvStream.end();
      });
  });
}

// Helper: Extract headers from a CSV file
function getCsvHeaders(csvFilePath) {
  return new Promise((resolve, reject) => {
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
  const columnTypes = await inferColumnTypes(csvFilePath, csvHeaders);
  const columns = csvHeaders.map((header, index) => ({ name: header, type: columnTypes[index] }));
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

// Helper function to infer column types from a CSV file
async function inferColumnTypes(csvFilePath, csvHeaders) {
  return new Promise((resolve, reject) => {
    const columnSamples = {};
    csvHeaders.forEach(header => columnSamples[header] = []);

    fs.createReadStream(csvFilePath)
      .pipe(csv.parse({ headers: true }))
      .on('data', (row) => {
        csvHeaders.forEach(header => {
          if (columnSamples[header].length < 10) { // Sample up to 10 rows
            columnSamples[header].push(row[header] || '');
          }
        });
      })
      .on('end', () => {
        const columnTypes = csvHeaders.map(header => inferSnowflakeType(columnSamples[header]));
        resolve(columnTypes);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

// Infer Snowflake-compatible data type from samples
function inferSnowflakeType(samples) {
  // Trim all samples for consistency
  samples = samples.map(s => (s || '').trim());

  // Check if all are boolean
  if (allBoolean(samples)) {
    return 'BOOLEAN';
  }

  // Check if all are numeric
  if (allNumeric(samples)) {
    // Determine if there is any decimal
    const anyDecimal = samples.some(val => val.replace(/,/g, '').includes('.'));
    if (anyDecimal) {
      return 'FLOAT'; // or 'NUMBER(38, 4)', etc., as needed
    } else {
      return 'NUMBER(38,0)';
    }
  }

  // Check if all are valid dates/timestamps
  const allDates = samples.every(isValidDate);
  if (allDates) {
    const anyHasTime = samples.some(hasTimeComponent);
    return anyHasTime ? 'TIMESTAMP_NTZ' : 'DATE';
  }

  // If none of the above conditions match, default to VARCHAR
  return 'VARCHAR';
}

// Check if all samples are boolean-like ('true'/'false')
function allBoolean(samples) {
  return samples.every(val => /^(true|false)$/i.test(val.trim()));
}

// Check if all samples are numeric (after removing commas)
function allNumeric(samples) {
  return samples.every(val => {
    const cleanVal = val.replace(/,/g, '').trim();
    return cleanVal !== '' && !isNaN(cleanVal);
  });
}

// Check if a value is a valid date or timestamp
function isValidDate(value) {
  return !isNaN(Date.parse(value));
}

// Check if a string includes a time component (rough check)
function hasTimeComponent(value) {
  return /\b\d{1,2}:\d{2}(:\d{2})?\b/.test(value);
}

