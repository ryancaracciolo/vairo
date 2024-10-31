import express from 'express';
import businessRoutes from './routes/businessRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use('/api/users', businessRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/threads', businessRoutes);



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 