import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import dynamodb, { s3Client } from '../../config/dbConfig.js';
import { addDataSource } from '../dataSourceController.js';


export const handleExcel = async (req, res) => {
  const { creatorUserId, data } = req.body;
  const { connectionName } = JSON.parse(data);
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

    // Trigger Airbyte Sync
    await triggerAirbyteSync();
    console.log("File uploaded to S3 with key: ", s3Key);

    // Clean up local files
    fs.unlinkSync(excelFilePath);
    fs.unlinkSync(csvFilePath);

    //await addDataSource(creatorUserId, connectionName, dataSourceType, s3Key);

    res.status(200).send('File uploaded and processed successfully.');
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).send('An error occurred while processing the file.');
  }
};

// Function to convert Excel to CSV
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

// Function to upload file to S3
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

// Function to trigger Airbyte sync
async function triggerAirbyteSync() {
  // const airbyteUrl = `${process.env.AIRBYTE_API_URL}/connections/sync`;
  // const response = await axios.post(airbyteUrl, {
  //   connectionId: process.env.AIRBYTE_CONNECTION_ID,
  // });

  // if (response.status !== 200) {
  //   throw new Error('Failed to trigger Airbyte sync.');
  // }
}
