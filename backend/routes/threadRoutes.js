import express from 'express';
import { createThread, getThreadMessages, editThreadTitle, deleteThread, chatWithAI, updateThread, getThread } from '../controllers/threadController.js';

const router = express.Router();

router.post('/create-thread', createThread);
router.post('/chat', chatWithAI);
router.get('/get-messages/:threadId', getThreadMessages);
router.put('/edit-thread', editThreadTitle);
router.put('/update-thread', updateThread);
router.delete('/delete-thread/:userId/:threadId', deleteThread);
router.get('/get-thread/:userId/:threadId', getThread);
export default router; 