import awsServerlessExpress from 'aws-serverless-express';
import server from './server.js';

const serverlessServer = awsServerlessExpress.createServer(server);

export const handler = (event, context) => awsServerlessExpress.proxy(serverlessServer, event, context);
