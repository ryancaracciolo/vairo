import express from 'express';
import { addWorkspace, getWorkspaceById, getWorkspaceByDomain } from '../controllers/workspaceController.js';

const router = express.Router();

router.post('/create-workspace', addWorkspace);
router.get('/get-workspace/:id', getWorkspaceById);
router.get('/get-ws-by-domain/:domain', getWorkspaceByDomain);

export default router; 