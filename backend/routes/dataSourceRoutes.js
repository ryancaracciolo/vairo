import express from 'express';
import { addDataSource, getDataSourceById, removeDataSources, addSchema, getDataSourceAccess } from '../controllers/dataSourceController.js';

const router = express.Router();

router.post('/add-data-source', addDataSource);
router.get('/get-data-source/:id', getDataSourceById);
router.post('/remove-data-sources', removeDataSources);
router.post('/add-schema', addSchema);
router.get('/get-users-with-access/:id', getDataSourceAccess);

export default router;
