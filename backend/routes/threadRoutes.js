import express from 'express';
import { createThread, addMessageToThread, getThreadMessages, editThreadTitle, deleteThread } from '../controllers/threadController.js';

const router = express.Router();

router.post('/create-thread', createThread);
router.post('/add-message', addMessageToThread);
router.get('/get-messages/:threadId', getThreadMessages);
router.put('/edit-thread', editThreadTitle);
router.delete('/delete-thread/:userId/:threadId', deleteThread);

export default router; 