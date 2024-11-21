import { handleExcel } from './connection_helpers/excel.js';
import { handlePostgres } from './connection_helpers/postgres.js';
import axios from 'axios';

const tableName = 'vairo-table'; 

export const connectAndCreateDataSource = async (req, res) => {
  const { creatorUserId, data } = req.body;
  const { dataSourceType } = JSON.parse(data);  

  switch (dataSourceType) {
    case 'PostgreSQL':
      return await handlePostgres(req, res);
    case 'Excel':
      if (!req.file) {
        return res.status(400).json({ error: 'File not uploaded' });
      }
      return await handleExcel(req, res);
    default:
      return res.status(400).json({ error: 'Invalid data source type' });
  }
}