import express from 'express';
import { addUser, 
    getUserById, 
    getUserByEmail, 
    getDataSources, 
    getUserThreads, 
    getUsersByIds, 
    editUserName, 
    getUserInvites
} from '../controllers/userController.js';

const router = express.Router();

router.post('/add-user', addUser);
router.get('/get-user/:id', getUserById);
router.post('/get-users-by-ids', getUsersByIds);
router.get('/get-user-by-email/:email', getUserByEmail);
router.get('/get-data-sources/:id', getDataSources);
router.get('/get-threads/:userId', getUserThreads);
router.put('/update-name/:id', editUserName);
router.get('/get-user-invites/:email', getUserInvites);


export default router;