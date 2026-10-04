// This script handles users applying to projects logic
import pool from '../config/db.js';

export const applyToProject = async (req, res) => {
  try {
    const { projectId, message } = req.body;
    const applicantId = req.user.userId; // From verifyToken middleware

    // 1. Fetch the project to check its status and author
    const projectCheck = await pool.query(
      'SELECT author_id, status FROM projects WHERE id = $1', 
      [projectId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const project = projectCheck.rows[0];

    // 2. Validate the application logic
    if (project.status !== 'open') {
      return res.status(400).json({ message: 'This project is no longer accepting members' });
    }

    if (project.author_id === applicantId) {
      return res.status(400).json({ message: 'You cannot apply to your own project' });
    }

    // 3. Insert the application
    const newApplication = await pool.query(
      `INSERT INTO applications (project_id, applicant_id, message) 
       VALUES ($1, $2, $3) RETURNING *`,
      [projectId, applicantId, message]
    );

    res.status(201).json({
      message: 'Application submitted successfully!',
      application: newApplication.rows[0]
    });

  } catch (error) {
    // 4. CONCURRENCY CATCH: Postgres throws code '23505' for Unique Constraint Violations
    if (error.code === '23505') {
      return res.status(409).json({ message: 'You have already applied to this project.' });
    }
    
    console.error('Error applying to project:', error);
    res.status(500).json({ message: 'Server error while applying' });
  }
};

export const respondToApplication = async (req, res) => {
  const { status } = req.body; // Expects 'accepted' or 'rejected'
  const applicationId = req.params.id;
  const authorId = req.user.userId;

  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be accepted or rejected' });
  }

  // 1. Grab a dedicated client from the pool for our Transaction
  const client = await pool.connect();

  try {
    // 2. Start the transaction
    await client.query('BEGIN');

    // 3. Fetch the application AND the project data simultaneously.
    // FOR UPDATE OF p locks the specific project row so no one else can modify it right now!
    const appQuery = await client.query(`
      SELECT a.id, a.status AS app_status, p.id AS project_id, p.author_id, p.members_required, p.status AS project_status
      FROM applications a
      JOIN projects p ON a.project_id = p.id
      WHERE a.id = $1
      FOR UPDATE OF p
    `, [applicationId]);

    if (appQuery.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Application not found' });
    }

    const data = appQuery.rows[0];

    // 4. Authorization check: Is the logged-in user the author of this project?
    if (data.author_id !== authorId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'Not authorized to manage this project' });
    }

    // 5. Logical checks
    if (data.app_status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'This application has already been processed' });
    }

    if (status === 'accepted' && data.members_required <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Project is already full' });
    }

    // 6. Update the Application Status
    await client.query('UPDATE applications SET status = $1 WHERE id = $2', [status, applicationId]);

    // 7. If Accepted, update the Project's member count and status
    if (status === 'accepted') {
      const newMembersCount = data.members_required - 1;
      const newProjectStatus = newMembersCount === 0 ? 'closed' : 'open';

      await client.query(
        'UPDATE projects SET members_required = $1, status = $2 WHERE id = $3',
        [newMembersCount, newProjectStatus, data.project_id]
      );
    }

    // 8. Commit the transaction (saves all changes and releases the lock)
    await client.query('COMMIT');

    res.status(200).json({ 
      message: `Application ${status} successfully!` 
    });

  } catch (error) {
    // If anything goes wrong, undo all database changes made inside the BEGIN block
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    res.status(500).json({ message: 'Server error processing application' });
  } finally {
    // 9. Always return the client to the pool, even if an error occurred
    client.release();
  }
};