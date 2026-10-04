document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  // --- 1. FETCH AND RENDER USERS ---
  try {
    const userRes = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (userRes.status === 403) {
      alert('Access Denied: You do not have admin privileges.');
      window.location.href = '/projects.html';
      return;
    }

    const users = await userRes.json();
    const tbody = document.getElementById('usersTableBody');
    document.getElementById('usersStatus').textContent = ''; // Clear loading text

    tbody.innerHTML = users.map(user => `
      <tr>
        <td>${user.id}</td>
        <td><strong>${user.name}</strong><br><small>${user.city || 'No city'}</small></td>
        <td>${user.email}</td>
        <td><span style="background: ${user.role === 'admin' ? '#f59e0b' : '#e2e8f0'}; padding: 2px 6px; border-radius: 4px;">${user.role}</span></td>
        <td>${user.created_projects.length}</td>
        <td>${user.applied_projects.length}</td>
        <td>
          ${user.role !== 'admin' ? `<button class="danger-btn" onclick="removeUser(${user.id})">Delete User</button>` : '<em>Admin</em>'}
        </td>
      </tr>
    `).join('');

  } catch (error) {
    document.getElementById('usersStatus').textContent = 'Failed to load user data.';
    document.getElementById('usersStatus').style.color = 'red';
  }

  // --- 2. FETCH AND RENDER FEEDBACKS ---
  try {
    const feedbackRes = await fetch('/api/admin/feedbacks', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const feedbacks = await feedbackRes.json();
    const fBody = document.getElementById('feedbackTableBody');

    if (feedbacks.length === 0) {
      fBody.innerHTML = '<tr><td colspan="4">No feedback submitted yet.</td></tr>';
    } else {
      fBody.innerHTML = feedbacks.map(fb => `
        <tr>
          <td>${new Date(fb.created_at).toLocaleDateString()}</td>
          <td>${fb.name}</td>
          <td>${fb.email}</td>
          <td>${fb.message}</td>
        </tr>
      `).join('');
    }
  } catch (error) {
    console.error('Failed to load feedbacks');
  }
});

// --- 3. DELETE USER LOGIC ---
window.removeUser = async (userId) => {
  if (!confirm('WARNING: This will permanently delete this user and all their created projects and applications. Proceed?')) return;

  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      alert('User deleted successfully.');
      window.location.reload(); // Refresh the table
    } else {
      const data = await response.json();
      alert(`Error: ${data.message}`);
    }
  } catch (error) {
    alert('Failed to connect to server.');
  }
};

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = '/login.html';
});