import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';
import { S3Client } from '@aws-sdk/client-s3';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

//Load environment variables
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config({ path: '.env.development' });
}

// Configure AWS SDK v3 DynamoDB client
const dbClient = new DynamoDBClient();
const dynamodb = DynamoDBDocumentClient.from(dbClient);

// Configure AWS SDK v3 S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: fromNodeProviderChain(),
});

// Export the DynamoDB client and S3 client
export default dynamodb;
export { s3Client };
