import pool from '../config/db.js';

export const isAdmin = async (req, res, next) => {
  try {
    // req.user.userId comes from your verifyToken middleware!
    const userQuery = await pool.query('SELECT role FROM users WHERE id = $1', [req.user.userId]);
    
    if (userQuery.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userQuery.rows[0].role !== 'admin') {
      return res.status(403).json({ message: 'Access Denied. Admin privileges required.' });
    }

    // If they are an admin, let them proceed to the controller
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({ message: 'Server error verifying admin status' });
  }
};