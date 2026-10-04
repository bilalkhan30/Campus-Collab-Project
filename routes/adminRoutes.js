import express from 'express';
import { getAdminDashboardData, deleteUser, getAdminFeedbacks } from '../controllers/adminController.js';
import { verifyToken } from '../middleware/authMiddleware.js'; // Your auth file
import { isAdmin } from '../middleware/adminMiddleware.js'; // Our new admin file

const router = express.Router();

// GET /api/admin/users - Returns all users and their project/application info
router.get('/users', verifyToken, isAdmin, getAdminDashboardData);

// DELETE /api/admin/users/:id - Deletes a specific user
router.delete('/users/:id', verifyToken, isAdmin, deleteUser);

// NEW: GET /api/admin/feedbacks
router.get('/feedbacks', verifyToken, isAdmin, getAdminFeedbacks);

export default router;