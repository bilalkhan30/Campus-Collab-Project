// This script handles updating text fields, hashing a new password if the user provides one
//  and saving the Cloudinary URLs if files were uploaded.

import pool from '../config/db.js';
import bcrypt from 'bcrypt';

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // From verifyToken
    const { name, city, contact, bio, password } = req.body;

    // 1. Check if files were uploaded. 
    // Cloudinary automatically attaches the secure URL to req.files[fieldname][0].path
    const profilePicUrl = req.files?.profile_pic ? req.files.profile_pic[0].path : null;
    const resumeUrl = req.files?.resume ? req.files.resume[0].path : null;

    // 2. Handle Password Update (if the user typed a new one)
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // 3. Update the database using COALESCE
    // This allows partial updates (e.g., updating just the bio without losing the existing profile pic)
    const updatedUser = await pool.query(
      `UPDATE users 
       SET 
         name = COALESCE($1, name),
         city = COALESCE($2, city),
         contact = COALESCE($3, contact),
         bio = COALESCE($4, bio),
         password = COALESCE($5, password),
         profile_pic = COALESCE($6, profile_pic),
         resume = COALESCE($7, resume)
       WHERE id = $8 
       RETURNING id, name, email, city, contact, bio, profile_pic, resume`,
      [name, city, contact, bio, hashedPassword, profilePicUrl, resumeUrl, userId]
    );

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser.rows[0] // We send back the updated data to refresh the frontend UI
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const userResult = await pool.query(
      'SELECT id, name, email, city, contact, bio, profile_pic, resume FROM users WHERE id = $1',
      [userId]
    );

    const appliedResult = await pool.query(`
      SELECT a.id, a.status AS app_status, p.title, p.status AS project_status 
      FROM applications a
      JOIN projects p ON a.project_id = p.id
      WHERE a.applicant_id = $1
    `, [userId]);

    const authoredResult = await pool.query(
      'SELECT id, title, status, members_required FROM projects WHERE author_id = $1',
      [userId]
    );

    // --- NEW: Get applications received for the user's projects ---
    const receivedResult = await pool.query(`
      SELECT 
        a.id AS app_id, a.message, a.status AS app_status,
        u.name AS applicant_name, u.contact, u.resume,
        p.title AS project_title
      FROM applications a
      JOIN users u ON a.applicant_id = u.id
      JOIN projects p ON a.project_id = p.id
      WHERE p.author_id = $1
      ORDER BY a.created_at DESC
    `, [userId]);

    res.status(200).json({
      user: userResult.rows[0],
      appliedProjects: appliedResult.rows,
      authoredProjects: authoredResult.rows,
      receivedApplications: receivedResult.rows // Send this to the frontend
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error loading profile' });
  }
};