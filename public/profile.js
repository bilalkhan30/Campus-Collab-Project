document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  // --- 1. LOAD PROFILE DATA ---
  try {
    const response = await fetch('/api/users/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Populate text fields
      document.getElementById('email').value = data.user.email;
      document.getElementById('name').value = data.user.name;
      document.getElementById('city').value = data.user.city || '';
      document.getElementById('contact').value = data.user.contact || '';
      document.getElementById('bio').value = data.user.bio || '';

      // Render Applied Projects
      const appContainer = document.getElementById('myApplicationsContainer');
      if (data.appliedProjects.length === 0) {
        appContainer.innerHTML = '<p>You have not applied to any projects yet.</p>';
      } else {
        appContainer.innerHTML = data.appliedProjects.map(app => `
          <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
            <strong>${app.title}</strong> 
            <span style="float:right; color: ${app.app_status === 'accepted' ? 'green' : 'orange'}">
              ${app.app_status.toUpperCase()}
            </span>
          </div>
        `).join('');
      }

      // Render Created Projects
      const projContainer = document.getElementById('myProjectsContainer');
      if (data.authoredProjects.length === 0) {
        projContainer.innerHTML = '<p>You have not created any projects yet.</p>';
      } else {
        projContainer.innerHTML = data.authoredProjects.map(proj => `
          <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
            <strong>${proj.title}</strong> (${proj.members_required} slots left)
            <span style="float:right;">Status: ${proj.status}</span>
          </div>
        `).join('');
      }
    }
  } catch (error) {
    console.error('Failed to load profile');
  }
});

// --- 2. HANDLE PROFILE UPDATE & FILE UPLOAD ---
document.getElementById('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const statusMessage = document.getElementById('statusMessage');
  
  statusMessage.textContent = "Uploading... please wait.";
  statusMessage.style.color = "orange";

  // Use FormData to handle text + files together
  const formData = new FormData();
  formData.append('name', document.getElementById('name').value);
  formData.append('city', document.getElementById('city').value);
  formData.append('contact', document.getElementById('contact').value);
  formData.append('bio', document.getElementById('bio').value);

  // Check if user actually selected a file before appending
  const profilePic = document.getElementById('profile_pic').files[0];
  if (profilePic) formData.append('profile_pic', profilePic);

  const resume = document.getElementById('resume').files[0];
  if (resume) formData.append('resume', resume);

  try {
    const response = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
        // CRITICAL: Do NOT set 'Content-Type' here. The browser does it automatically for FormData.
      },
      body: formData
    });

    const result = await response.json();

    if (response.ok) {
      statusMessage.textContent = "Profile and files updated successfully!";
      statusMessage.style.color = "green";
    } else {
      statusMessage.textContent = result.message;
      statusMessage.style.color = "red";
    }
  } catch (error) {
    statusMessage.textContent = "An error occurred during upload.";
    statusMessage.style.color = "red";
  }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = '/login.html';
});