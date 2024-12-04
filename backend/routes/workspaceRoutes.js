import express from 'express';
import { addWorkspace, 
    getWorkspaceById, 
    getWorkspaceByDomain, 
    updateWorkspaceName, 
    updateWorkspaceSubscription, 
    inviteMembers, 
    getInvitesSent,
    inviteAccepted
} from '../controllers/workspaceController.js';

const router = express.Router();

router.post('/create-workspace', addWorkspace);
router.get('/get-workspace/:id', getWorkspaceById);
router.get('/get-ws-by-domain/:domain', getWorkspaceByDomain);
router.put('/update-name/:id', updateWorkspaceName);
router.put('/update-subscription/:id', updateWorkspaceSubscription);
router.post('/invite-members', inviteMembers);
router.get('/invites-sent/:workspaceId', getInvitesSent);
router.post('/invite-accepted', inviteAccepted);

export default router; 