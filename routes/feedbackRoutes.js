import express from 'express';
import { submitFeedback } from '../controllers/feedbackController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 2, 
  message: { message: "Too many feedback requests from this IP. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/feedback - Public route and also do limit control so multiple feedback requests form same IP reject
// There is a cooldown of 1 hour after submitting 2 feedbacks abck toback
router.post('/', feedbackLimiter, submitFeedback);

export default router;