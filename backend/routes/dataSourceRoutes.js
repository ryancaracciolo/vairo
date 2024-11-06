import express from 'express';
import { addDataSource, getDataSourceById } from '../controllers/dataSourceController.js';

const router = express.Router();

router.post('/add-data-source', addDataSource);
router.get('/get-data-source/:id', getDataSourceById);

export default router;
