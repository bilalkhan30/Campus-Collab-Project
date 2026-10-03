// This script allows to create, fetch, update and delete porjects

import pool from '../config/db.js';

// Creating a new project logic
export const createProject = async (req, res) => {
  try {
    const { title, description, members_required, skills } = req.body;  
    // We get this from verifyToken middleware
    const authorId = req.user.userId; 
    if (!title || !description || !members_required || !skills) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const newProject = await pool.query(
      `INSERT INTO projects (author_id, title, description, members_required, skills) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [authorId, title, description, members_required, skills]
    );
    res.status(201).json({
      message: 'Project created successfully!',
      project: newProject.rows[0]
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server error while creating project' });
  }
};
// Fetching all open to apply projects for home feed
export const getProjects = async (req, res) => {
  try {
    // We use a JOIN to also grab the author's name and profile pic from the users table
    const projects = await pool.query(`
      SELECT 
        p.id, p.title, p.description, p.members_required, p.skills, p.status, p.created_at,
        u.name AS author_name, u.profile_pic AS author_pic
      FROM projects p
      JOIN users u ON p.author_id = u.id
      WHERE p.status = 'open'
      ORDER BY p.created_at DESC
    `);
    res.status(200).json(projects.rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error while fetching projects' });
  }
};
// Updating  project details
export const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.userId; // From verifyToken middleware
    const { title, description, members_required, skills, status } = req.body;

    // 1. Find the project to see who owns it
    const projectCheck = await pool.query('SELECT author_id FROM projects WHERE id = $1', [projectId]);

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // 2. AUTHORIZATION CHECK: Does the logged-in user own this project?
    if (projectCheck.rows[0].author_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to edit this project' });
    }

    // 3. Update the project using COALESCE
    // COALESCE means: "If the frontend didn't send a new title ($1), keep the old title (title)"
    // This allows partial updates (e.g., just changing the status to "closed")
    const updatedProject = await pool.query(
      `UPDATE projects 
       SET 
         title = COALESCE($1, title), 
         description = COALESCE($2, description), 
         members_required = COALESCE($3, members_required), 
         skills = COALESCE($4, skills),
         status = COALESCE($5, status)
       WHERE id = $6 
       RETURNING *`,
      [title, description, members_required, skills, status, projectId]
    );

    res.status(200).json({
      message: 'Project updated successfully',
      project: updatedProject.rows[0]
    });

  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server error while updating project' });
  }
};

// deleting a project
export const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.userId;

    // 1. Find the project
    const projectCheck = await pool.query('SELECT author_id FROM projects WHERE id = $1', [projectId]);

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // 2. Authourization check
    if (projectCheck.rows[0].author_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    // 3. Delete the project
    await pool.query('DELETE FROM projects WHERE id = $1', [projectId]);

    res.status(200).json({ message: 'Project deleted successfully' });

  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server error while deleting project' });
  }
};