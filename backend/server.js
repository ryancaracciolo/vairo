import express from 'express';
import bodyParser from 'body-parser'; // body-parser is a middleware used to parse incoming request bodies in a middleware before your handlers, available under the req.body property
import cors from 'cors'; // CORS (Cross-Origin Resource Sharing) is a middleware for Express that allos backend to accept requests from frontend running on a different origin
import dotenv from 'dotenv';
import businessRoutes from './routes/businessRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dataSourceRoutes from './routes/dataSourceRoutes.js';
import threadRoutes from './routes/threadRoutes.js';
import connectionRoutes from './routes/connectionRoutes.js';

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

app.use('/api/businesses', businessRoutes);
app.use('/api/users', userRoutes);
app.use('/api/data-sources', dataSourceRoutes);
app.use('/api/threads', threadRoutes);
app.use('/api/connections', connectionRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 