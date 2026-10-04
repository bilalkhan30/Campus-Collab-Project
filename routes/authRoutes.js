import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { upload } from '../config/cloudinary.js'; // Import Multer

const router = express.Router();
// POST /api/auth/register
router.post('/register', upload.fields([
  { name: 'profile_pic', maxCount: 1 }, 
  { name: 'resume', maxCount: 1 }
]), registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

export default router;