document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('projectsContainer');
  const token = localStorage.getItem('token');

  // 1. Check if user is logged in
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  // 2. Fetch projects from the backend
  try {
    const response = await fetch('/api/projects', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}` 
      }
    });

    if (response.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('token');
      window.location.href = '/login.html';
      return;
    }

    const projects = await response.json();

    // 3. Render the projects into the UI
    if (projects.length === 0) {
      container.innerHTML = '<p>No open projects found. Be the first to create one!</p>';
      return;
    }

    projects.forEach(project => {
      const card = document.createElement('div');
      card.className = 'project-card';
      
      // We format the skills array visually
      const skillsHtml = project.skills.map(skill => 
        `<span style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; margin-right: 5px;">${skill}</span>`
      ).join('');

      card.innerHTML = `
        <h3>${project.title}</h3>
        <p style="color: #64748b; font-size: 0.9rem;">By: ${project.author_name}</p>
        <p>${project.description}</p>
        <p><strong>Members Needed:</strong> ${project.members_required}</p>
        <div style="margin-top: 10px; margin-bottom: 15px;">${skillsHtml}</div>
        <button onclick="applyToProject(${project.id})">Apply to Join</button>
      `;
      
      container.appendChild(card);
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    container.innerHTML = '<p style="color:red;">Failed to load projects.</p>';
  }
});

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = '/login.html';
});

// The apply function (we will implement the actual API call in the next step)
window.applyToProject = (projectId) => {
  alert(`Application logic for project ${projectId} will go here!`);
};