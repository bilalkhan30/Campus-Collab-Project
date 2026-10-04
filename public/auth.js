
const registerForm = document.getElementById('registerForm');
const errorMessage = document.getElementById('errorMessage');

// Only run this code if we are actually on the registration page
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop the page from refreshing

    // 1. Gather the data from the inputs
    const userData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
      city: document.getElementById('city').value,
      contact: document.getElementById('contact').value,
      bio: document.getElementById('bio').value
    };

    try {
      // 2. Send the data to our Express backend
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      // 3. Handle success or failure
      if (response.ok) {
        // SUCCESS: Save the JWT token to the browser's local storage
        localStorage.setItem('token', data.token);
        
        // Redirect the user to the projects feed
        window.location.href = '/projects.html';
      } else {
        // FAILED: Show the error message sent from our backend (e.g., "User already exists")
        errorMessage.textContent = data.message;
      }

    } catch (error) {
      console.error('Fetch error:', error);
      errorMessage.textContent = 'Failed to connect to the server. Please try again.';
    }
  });
}

const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorMessage = document.getElementById('errorMessage');

    const credentials = {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    };

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok) {
        // Save the token and redirect to the protected feed
        localStorage.setItem('token', data.token);
        window.location.href = '/projects.html';
      } else {
        errorMessage.textContent = data.message;
      }
    } catch (error) {
      errorMessage.textContent = 'Connection failed.';
    }
  });
}