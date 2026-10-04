// public/profile.js

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

        // populate project cards
        const displayCard = document.getElementById('profileDisplayCard');
        const picUrl = data.user.profile_pic || 'https://via.placeholder.com/150'; // Default avatar

        displayCard.innerHTML = `
        <img src="${picUrl}" alt="Profile Picture">
        <div class="profile-info">
            <h2>${data.user.name}</h2>
            <p style="color: #64748b; margin-top: 0;">📍 ${data.user.city || 'No city added'} | 📞 ${data.user.contact || 'No contact added'}</p>
            <p>${data.user.bio || 'This user has not written a bio yet.'}</p>
            ${data.user.resume ? `<a href="${data.user.resume}" target="_blank" class="btn btn-outline" style="display: inline-block; margin-top: 10px;">📄 View Resume</a>` : ''}
        </div>
        `;

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

        // --- NEW: Render Received Applications ---
        const receivedContainer = document.getElementById('receivedApplicationsContainer');
        if (data.receivedApplications.length === 0) {
            receivedContainer.innerHTML = '<p>No applications received yet.</p>';
        } else {
            receivedContainer.innerHTML = data.receivedApplications.map(app => `
            <div style="border-bottom: 1px solid #e2e8f0; padding: 15px 0;">
                <h4 style="margin: 0 0 10px 0; color: #2563eb;">Project: ${app.project_title}</h4>
                <p style="margin: 5px 0;"><strong>Applicant:</strong> ${app.applicant_name} 
                ${app.resume ? `<a href="${app.resume}" target="_blank" style="color: blue; text-decoration: underline;">[View Resume]</a>` : ''}
                </p>
                <p style="margin: 5px 0; font-style: italic;">"${app.message || 'No message provided.'}"</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> ${app.app_status.toUpperCase()}</p>
                
                <!-- Only show Accept/Reject buttons if the application is still pending -->
                ${app.app_status === 'pending' ? `
                <div style="margin-top: 10px;">
                    <button onclick="respondToApp(${app.app_id}, 'accepted')" style="background: #16a34a; color: white; margin-right: 10px;">Accept</button>
                    <button onclick="respondToApp(${app.app_id}, 'rejected')" style="background: #dc2626; color: white;">Reject</button>
                </div>
                ` : ''}
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

// --- 3. RESPOND TO APPLICATIONS ---
window.respondToApp = async (applicationId, status) => {
  // Confirm before taking action
  if (!confirm(`Are you sure you want to mark this application as ${status}?`)) return;

  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`/api/applications/${applicationId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status }) // Sends { status: 'accepted' } or { status: 'rejected' }
    });

    const data = await response.json();

    if (response.ok) {
      alert(`Success: Application ${status}!`);
      window.location.reload(); // Refresh the page to update the UI and members_required count
    } else {
      // This will cleanly catch our concurrency checks (e.g., "Project is already full")
      alert(`Error: ${data.message}`);
    }
  } catch (error) {
    console.error('Error responding to application:', error);
    alert('Failed to process the request. Please try again.');
  }
};