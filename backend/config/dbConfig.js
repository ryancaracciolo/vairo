import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'; // Correct package for DynamoDBClient
import dotenv from 'dotenv'; // Package that loads environment variables from a .env file into process.env

// Load environment variables (optional if you're using Lambda's environment variables)
// if (process.env.NODE_ENV === 'production') {
//   dotenv.config({ path: '.env.production' });
// } else {
//   dotenv.config({ path: '.env.development' });
// }

dotenv.config();

// Create the DynamoDB client without credentials (use Lambda IAM Role)
const dbClient = new DynamoDBClient();

// Create the DynamoDB Document client using the DynamoDB client
const ddbDocClient = DynamoDBDocumentClient.from(dbClient);

export default ddbDocClient;
