import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { createProject, getProjects, updateProject, deleteProject } from '../controllers/projectController.js';

const router = express.Router();
// GET /api/projects - Public route, anyone can view open projects
router.get('/',verifyToken, getProjects);
// POST /api/projects - Protected route, only logged-in users can create
router.post('/', verifyToken, createProject);
// PUT /api/projects - logged in users can udpate the info on uploaded porjects
router.put('/:id', verifyToken, updateProject);
// DELETE /api/projects - logged in users can only delete their own projects
router.delete('/:id', verifyToken, deleteProject);

export default router;