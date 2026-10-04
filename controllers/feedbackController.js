// This script handles the feedback sent my users to admin

import pool from '../config/db.js';

export const submitFeedback = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if this specific email submitted feedback in the last 24 hours
    const recentFeedback = await pool.query(
      `SELECT * FROM feedbacks 
       WHERE email = $1 
       AND created_at >= NOW() - INTERVAL '1 day'`,
      [email]
    );

    if (recentFeedback.rows.length > 0) {
      // 429 is the HTTP status code for "Too Many Requests"
      return res.status(429).json({ message: 'You have already submitted feedback recently. Please try again tomorrow.' });
    }

    await pool.query(
      'INSERT INTO feedbacks (name, email, message) VALUES ($1, $2, $3)',
      [name, email, message]
    );

    res.status(201).json({ message: 'Feedback submitted successfully!' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Server error while submitting feedback' });
  }
};