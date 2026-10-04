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

    const allUsers = await userRes.json();

    const users = allUsers.filter(user => user.role !== 'admin');
    const tbody = document.getElementById('usersTableBody');
    document.getElementById('usersStatus').textContent = '';

    tbody.innerHTML = users.map(user => `
      <tr>
        <td>${user.id}</td>
        <td><strong>${user.name}</strong><br><small>${user.city || 'No city'}</small></td>
        <td>${user.email}</td>
        <td><span style="padding: 2px 6px; border-radius: 4px;">${user.role}</span></td>
        <td>${user.created_projects.length}</td>
        <td>${user.applied_projects.length}</td>
        <td>
          <!-- ADDED: The View button -->
          <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem; margin-right: 5px; cursor: pointer;" onclick="viewUserProfile(${user.id})">View Profile</button>
          
          ${user.role !== 'admin' ? `<button class="danger-btn" onclick="removeUser(${user.id})">Delete User</button>` : '<em style="color: #64748b; font-size: 0.9rem;">Admin Default</em>'}
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

// Add to the bottom of public/admin.js

window.viewUserProfile = async (userId) => {
  const modal = document.getElementById('profileModal');
  const content = document.getElementById('modalProfileContent');
  
  modal.style.display = 'flex';
  content.innerHTML = '<p style="text-align: center; color: #64748b;">Fetching profile...</p>';

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/users/${userId}/public`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const user = await response.json();
      const picUrl = user.profile_pic || 'https://via.placeholder.com/150';
      
      content.innerHTML = `
        <div style="text-align: center;">
          <img src="${picUrl}" alt="Profile Picture" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid var(--bg-color); margin-bottom: 1rem;">
          <h2 style="margin: 0; color: var(--text-main);">${user.name}</h2>
          
          <p style="color: #64748b; margin-top: 5px; margin-bottom: 5px; font-size: 0.9rem;">
            📍 ${user.city || 'Unknown'} | 📞 ${user.contact || 'No contact provided'}
          </p>
          
          <p style="margin-top: 0; margin-bottom: 15px; font-size: 0.95rem;">
            ✉️ <a href="mailto:${user.email}" style="color: var(--primary); text-decoration: underline;">${user.email}</a>
          </p>

          <div style="background: var(--bg-color); padding: 1rem; border-radius: 8px; margin: 1rem 0; text-align: left;">
            <p style="margin: 0; font-size: 0.95rem;">${user.bio || 'This user has not written a bio yet.'}</p>
          </div>
          
          ${user.resume ? `<a href="${user.resume}" target="_blank" class="btn btn-outline" style="width: 100%; display: block; box-sizing: border-box;">📄 View Full Resume</a>` : '<p style="color: #64748b; font-size: 0.9rem;">No resume uploaded.</p>'}
        </div>
      `;
    } else {
      content.innerHTML = '<p style="color: red; text-align: center;">Failed to load profile.</p>';
    }
  } catch (error) {
    content.innerHTML = '<p style="color: red; text-align: center;">Network error occurred.</p>';
  }
};

window.closeProfileModal = () => {
  document.getElementById('profileModal').style.display = 'none';
};

window.onclick = (event) => {
  const modal = document.getElementById('profileModal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};