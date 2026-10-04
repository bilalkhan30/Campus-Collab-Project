// public/auth.js (Replace your register logic with this)

const registerForm = document.getElementById('registerForm');
const errorMessage = document.getElementById('errorMessage');

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    errorMessage.textContent = 'Uploading and registering... Please wait.';
    errorMessage.style.color = 'orange';

    // Use FormData for files + text
    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('password', document.getElementById('password').value);
    formData.append('city', document.getElementById('city').value);
    formData.append('contact', document.getElementById('contact').value);
    formData.append('bio', document.getElementById('bio').value);

    const profilePic = document.getElementById('profile_pic').files[0];
    if (profilePic) formData.append('profile_pic', profilePic);

    const resume = document.getElementById('resume').files[0];
    if (resume) formData.append('resume', resume);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData // NO Content-Type header! Browser sets it automatically
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = '/projects.html';
      } else {
        errorMessage.textContent = data.message;
        errorMessage.style.color = 'red';
      }
    } catch (error) {
      errorMessage.textContent = 'Failed to connect to the server.';
      errorMessage.style.color = 'red';
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