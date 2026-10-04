import express from 'express';
import { applyToProject, respondToApplication } from '../controllers/applicationController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/applications - Protected route for users to apply
router.post('/', verifyToken, applyToProject);

// PUT /api/applications/:id/status - For the author to accept/reject
router.put('/:id/status', verifyToken, respondToApplication);

export default router;