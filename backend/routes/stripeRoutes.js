import express from 'express';
import bodyParser from 'body-parser';


import { createCheckoutSession, sessionStatus, handleStripeWebhook } from '../controllers/PaymentControllers/StripeController.js';

const router = express.Router();

router.post('/create-checkout-session', createCheckoutSession);
router.get('/session-status', sessionStatus);
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
