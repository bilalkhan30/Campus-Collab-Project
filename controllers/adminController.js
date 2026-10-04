import pool from '../config/db.js';

// Getting all users and their data
export const getAdminDashboardData = async (req, res) => {
  try {
    // 1. Get all basic user info
    const usersResult = await pool.query(`
      SELECT id, name, email, city, contact, role, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    const users = usersResult.rows;

    // 2. For each user, fetch the projects they created AND projects they applied to
    // We use Promise.all to fetch these concurrently for maximum speed
    for (let user of users) {
      // Fetch projects created by this user
      const createdProjects = await pool.query(
        'SELECT id, title, status FROM projects WHERE author_id = $1', 
        [user.id]
      );
      user.created_projects = createdProjects.rows;

      // Fetch projects this user applied to
      const appliedProjects = await pool.query(`
        SELECT a.id AS application_id, a.status AS application_status, p.title AS project_title
        FROM applications a
        JOIN projects p ON a.project_id = p.id
        WHERE a.applicant_id = $1
      `, [user.id]);
      user.applied_projects = appliedProjects.rows;
    }

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ message: 'Server error loading admin data' });
  }
};

// Deleting a user
export const deleteUser = async (req, res) => {
  try {
    const userIdToDelete = req.params.id;

    // We can't let an admin delete themselves by accident
    if (userIdToDelete == req.user.userId) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    const deleteResult = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [userIdToDelete]);

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    /* 
      Because we set ON DELETE CASCADE in our database schema for both the 
      projects and applications tables, Postgres will automatically delete 
      all projects and applications associated with this user for us! 
    */

    res.status(200).json({ message: 'User and all their associated data deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};