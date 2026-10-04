import express from 'express';
import { updateProfile, getUserProfile, getPublicProfile } from '../controllers/userController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// PUT /api/users/profile
router.put(
  '/profile', 
  verifyToken, 
  upload.fields([
    { name: 'profile_pic', maxCount: 1 }, 
    { name: 'resume', maxCount: 1 }
  ]), 
  updateProfile
);

// Fectching user profile
router.get('/profile', verifyToken, getUserProfile);

// Route for fetching user profile for other viewers
router.get('/:id/public', verifyToken, getPublicProfile);

export default router;