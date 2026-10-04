// public/projects.js

let allProjects = []; // Master list to hold data so we don't spam the server

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
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
      <h3>${project.title}</h3>
      <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
        By: <strong>${project.author_name}</strong> 
        <span style="float: right;">📍 ${project.author_city || 'Remote'}</span>
      </p>
      <p>${project.description}</p>
      <p><strong>Members Needed:</strong> ${project.members_required}</p>
      <div style="margin-top: 10px; margin-bottom: 15px;">${skillsHtml}</div>
      <button onclick="applyToProject(${project.id})">Apply to Join</button>
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