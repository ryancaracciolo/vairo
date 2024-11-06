import express from 'express';
import { addUser, getUserById, getUserByEmail, getDataSources, getUserThreads } from '../controllers/userController.js';

const router = express.Router();

router.post('/add-user', addUser);
router.get('/get-user/:id', getUserById);
router.get('/get-user-by-email/:email', getUserByEmail);
router.get('/get-data-sources/:id', getDataSources);
router.get('/get-threads/:userId', getUserThreads);


export default router; 