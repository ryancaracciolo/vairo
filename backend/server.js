import express from 'express';
import bodyParser from 'body-parser'; // body-parser is a middleware used to parse incoming request bodies in a middleware before your handlers, available under the req.body property
import cors from 'cors'; // CORS (Cross-Origin Resource Sharing) is a middleware for Express that allos backend to accept requests from frontend running on a different origin
import workspaceRoutes from './routes/workspaceRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dataSourceRoutes from './routes/dataSourceRoutes.js';
import threadRoutes from './routes/threadRoutes.js';
import connectionRoutes from './routes/connectionRoutes.js';
import airByteRoutes from './routes/airByteRoutes.js';

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use('/api/workspaces', workspaceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/data-sources', dataSourceRoutes);
app.use('/api/threads', threadRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/airbyte', airByteRoutes);

app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// Start the server if running locally
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Running in ${process.env.NODE_ENV} mode`);
  });
}
  
export default app;