import pool from '../config/dbConfig.js';

export const getAllBusinesses = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM businesses');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
}; 