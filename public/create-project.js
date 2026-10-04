document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  const form = document.getElementById('createProjectForm');
  const statusMessage = document.getElementById('statusMessage');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset status message
    statusMessage.textContent = 'Creating project...';
    statusMessage.style.color = 'orange';

    // 1. Process the skills string into a clean array
    const skillsInput = document.getElementById('skills').value;
    const skillsArray = skillsInput
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0); // Removes any empty items if user types extra commas

    // 2. Prepare the data payload matching our backend expectations
    const projectData = {
      title: document.getElementById('title').value,
      description: document.getElementById('description').value,
      members_required: parseInt(document.getElementById('members_required').value, 10),
      skills: skillsArray
    };

    // 3. Send the POST request
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(projectData)
      });

      const data = await response.json();

      if (response.ok) {
        statusMessage.textContent = 'Project created successfully! Redirecting...';
        statusMessage.style.color = 'green';
        
        // Redirect to feed after a short delay
        setTimeout(() => {
          window.location.href = '/projects.html';
        }, 1000);
      } else {
        statusMessage.textContent = data.message || 'Failed to create project.';
        statusMessage.style.color = 'red';
      }
    } catch (error) {
      console.error('Error:', error);
      statusMessage.textContent = 'Network error. Please try again.';
      statusMessage.style.color = 'red';
    }
  });

  // Logout functionality
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
  });
});