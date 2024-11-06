import express from 'express';
import { addBusiness, getBusinessById } from '../controllers/businessController.js';

const router = express.Router();

router.post('/add-business', addBusiness);
router.get('/get-business/:id', getBusinessById);

export default router;
