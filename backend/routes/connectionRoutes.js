import express from 'express';
import { connectAndCreateDataSource } from '../controllers/connectionController.js';

const router = express.Router();

router.post('/connect', connectAndCreateDataSource);

export default router;
