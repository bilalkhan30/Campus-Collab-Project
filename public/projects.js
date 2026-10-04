// public/projects.js

let allProjects = []; // Master list to hold data so we don't spam the server

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  // Add this near the top of projects.js
  const userRole = localStorage.getItem('role');
  if (userRole === 'admin') {
    // Hide the standard user links
    document.getElementById('navNewProject').style.display = 'none';
    document.getElementById('navProfile').style.display = 'none';

    // Show the Admin Panel button
    document.getElementById('adminNavSpot').innerHTML = `
      <a href="admin.html" class="btn" style="background: #dc2626; color: white; margin-right: 1rem; border: none;">Admin Panel</a>
    `;
  }
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  // --- 1. FETCH PROJECTS ---
  try {
    const response = await fetch('/api/projects', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login.html';
      return;
    }

    allProjects = await response.json();
    renderProjects(allProjects); // Initial render of all projects

  } catch (error) {
    console.error('Error fetching projects:', error);
    document.getElementById('projectsContainer').innerHTML = '<p style="color:red;">Failed to load projects.</p>';
  }
});

// --- 2. FILTER LOGIC ---
const filterCityInput = document.getElementById('filterCity');
const filterSkillInput = document.getElementById('filterSkill');

// Listen for typing in either search box
filterCityInput.addEventListener('input', applyFilters);
filterSkillInput.addEventListener('input', applyFilters);

function applyFilters() {
  const cityQuery = filterCityInput.value.toLowerCase().trim();
  const skillQuery = filterSkillInput.value.toLowerCase().trim();

  const filtered = allProjects.filter(project => {
    // Check if the project city includes the typed search
    const projectCity = (project.author_city || '').toLowerCase();
    const matchesCity = projectCity.includes(cityQuery);

    // Check if ANY of the project's skills include the typed search
    // If the input is empty, it automatically passes this check
    const matchesSkill = skillQuery === '' || project.skills.some(skill => 
      skill.toLowerCase().includes(skillQuery)
    );

    // Both conditions must be true to show the card
    return matchesCity && matchesSkill;
  });

  renderProjects(filtered);
}

// --- 3. RENDER LOGIC ---
function renderProjects(projectsToRender) {
  const container = document.getElementById('projectsContainer');
  container.innerHTML = ''; // Clear the current view

  // ADD THIS LINE HERE: Grab the role right before we render!
  const currentRole = localStorage.getItem('role'); 

  if (projectsToRender.length === 0) {
    container.innerHTML = '<p>No projects found matching your search criteria.</p>';
    return;
  }

  projectsToRender.forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    // Style the skills as small "tags"
    const skillsHtml = project.skills.map(skill => 
      `<span style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; margin-right: 5px; display: inline-block; margin-bottom: 5px;">${skill}</span>`
    ).join('');

    card.innerHTML = `
      <h3 style="margin-top: 0;">${project.title}</h3>
      <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
        By: <strong style="cursor: pointer; color: var(--primary); text-decoration: underline;" onclick="viewAuthorProfile(${project.author_id})">${project.author_name}</strong> 
        <span style="float: right;">📍 ${project.author_city || 'Remote'}</span>
      </p>
      <p>${project.description}</p>
      <p><strong>Members Needed:</strong> ${project.members_required}</p>
      
      <p style="margin-bottom: 5px; font-size: 0.9rem;"><strong>Skills Required:</strong></p>
      <div style="margin-bottom: 15px;">${skillsHtml}</div>
      
      <!-- Check the newly defined currentRole variable here -->
      ${currentRole !== 'admin' ? `<button onclick="applyToProject(${project.id})" style="margin-top: auto; width: 100%;">Apply to Join</button>` : '<em style="display: block; text-align: center; color: #64748b; margin-top: auto; padding: 0.5rem; font-size: 0.9rem;">Admin Viewing Mode</em>'}
    `;

    container.appendChild(card);
  });
}

// --- 4. APPLICATION & LOGOUT LOGIC ---
window.applyToProject = async (projectId) => {
  const token = localStorage.getItem('token');
  if (!token) return alert("Please log in to apply.");

  const message = prompt("Why are you a good fit for this project? (Optional)");
  if (message === null) return; 

  try {
    const response = await fetch('/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ projectId, message })
    });

    const data = await response.json();

    if (response.ok) {
      alert("Application submitted successfully!");
    } else {
      alert(`Error: ${data.message}`); 
    }
  } catch (error) {
    console.error('Application error:', error);
    alert('Failed to submit application. Please try again.');
  }
};

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = '/login.html';
});

// Add to bottom of public/projects.js

window.viewAuthorProfile = async (authorId) => {
  const modal = document.getElementById('profileModal');
  const content = document.getElementById('modalProfileContent');
  
  // Show the modal with a loading state
  modal.style.display = 'flex';
  content.innerHTML = '<p style="text-align: center; color: #64748b;">Fetching profile...</p>';

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/users/${authorId}/public`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const user = await response.json();
      const picUrl = user.profile_pic || 'https://via.placeholder.com/150';
      
      // Inject the author's data into the modal
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

// Also close the modal if the user clicks the dark background outside the white box
window.onclick = (event) => {
  const modal = document.getElementById('profileModal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};