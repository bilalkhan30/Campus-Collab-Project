document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const navMenu = document.getElementById('navMenu');

  // Dynamically change header based on login status
  if (token) {
    navMenu.innerHTML = `
      <a href="projects.html" style="color: white; margin-right: 15px;">Feed</a>
      <a href="profile.html" style="color: white; margin-right: 15px;">Profile</a>
      <button id="logoutBtn" style="background: transparent; border: 1px solid white;">Logout</button>
    `;

    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.reload();
    });
  } else {
    navMenu.innerHTML = `
      <a href="login.html" style="color: white; margin-right: 15px;">Login</a>
      <a href="register.html" style="color: white; background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 4px; text-decoration: none;">Register</a>
    `;
  }
});

// Handle Feedback Form Submission
document.getElementById('feedbackForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const statusMsg = document.getElementById('fb_status');
  statusMsg.textContent = 'Sending...';
  statusMsg.style.color = 'yellow';

  const feedbackData = {
    name: document.getElementById('fb_name').value,
    email: document.getElementById('fb_email').value,
    message: document.getElementById('fb_message').value
  };

  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData)
    });

    if (response.ok) {
      statusMsg.textContent = 'Thank you! Your feedback has been sent to the admin.';
      statusMsg.style.color = '#4ade80'; // Light green
      document.getElementById('feedbackForm').reset();
    } else {
      statusMsg.textContent = 'Failed to send feedback. Please try again.';
      statusMsg.style.color = '#f87171'; // Light red
    }
  } catch (error) {
    console.error('Feedback error:', error);
    statusMsg.textContent = 'Network error. Please try again later.';
    statusMsg.style.color = '#f87171';
  }
});