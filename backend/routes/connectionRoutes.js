import express from 'express';
import { scrapeDatabase, addTables } from '../controllers/connectionController.js';

const router = express.Router();

router.post('/scrape-database', scrapeDatabase);
router.post('/add-tables', addTables);

export default router;
