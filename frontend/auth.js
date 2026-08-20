const API_URL = 'http://localhost:5000/api/auth';

// Tab switching
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showLogin = document.getElementById('show-login');
const showSignup = document.getElementById('show-signup');

showLogin.addEventListener('click', () => {
  loginForm.style.display = 'flex';
  signupForm.style.display = 'none';
  showLogin.classList.add('active');
  showSignup.classList.remove('active');
});

showSignup.addEventListener('click', () => {
  signupForm.style.display = 'flex';
  loginForm.style.display = 'none';
  showSignup.classList.add('active');
  showLogin.classList.remove('active');
});

// LOGIN
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = document.getElementById('login-message');

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      message.textContent = data.error || 'Login failed';
      message.style.color = 'red';
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    message.textContent = 'Login successful!';
    message.style.color = 'green';

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 800);

  } catch (err) {
    message.textContent = 'Something went wrong. Try again.';
    message.style.color = 'red';
    console.error(err);
  }
});

// SIGNUP
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = document.getElementById('signup-message');

  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  try {
    const res = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      message.textContent = data.error || 'Signup failed';
      message.style.color = 'red';
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    message.textContent = 'Account created!';
    message.style.color = 'green';

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 800);

  } catch (err) {
    message.textContent = 'Something went wrong. Try again.';
    message.style.color = 'red';
    console.error(err);
  }
});


// FORGOT / RESET PASSWORD ELEMENTS
const forgotForm = document.getElementById('forgot-form');
const resetForm = document.getElementById('reset-form');
const showForgot = document.getElementById('show-forgot');
const backToLogin = document.getElementById('back-to-login');

// Show forgot-password form
showForgot.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.style.display = 'none';
  signupForm.style.display = 'none';
  forgotForm.style.display = 'flex';
});

// Back to login from forgot form
backToLogin.addEventListener('click', (e) => {
  e.preventDefault();
  forgotForm.style.display = 'none';
  loginForm.style.display = 'flex';
});

// FORGOT PASSWORD SUBMIT
forgotForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = document.getElementById('forgot-message');
  const email = document.getElementById('forgot-email').value;

  try {
    const res = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    message.textContent = data.message || 'If that email is registered, a reset link has been sent.';
    message.style.color = 'green';

  } catch (err) {
    message.textContent = 'Something went wrong. Try again.';
    message.style.color = 'red';
    console.error(err);
  }
});

// RESET PASSWORD SUBMIT (runs if page loaded with ?token=...)
resetForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = document.getElementById('reset-message');
  const newPassword = document.getElementById('reset-password').value;

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  try {
    const res = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });

    const data = await res.json();

    if (!res.ok) {
      message.textContent = data.message || 'Reset failed';
      message.style.color = 'red';
      return;
    }

    message.textContent = 'Password reset! Redirecting to login...';
    message.style.color = 'green';

    setTimeout(() => {
      window.location.href = 'auth.html';
    }, 1200);

  } catch (err) {
    message.textContent = 'Something went wrong. Try again.';
    message.style.color = 'red';
    console.error(err);
  }
});

// ON PAGE LOAD: if URL has ?token=, show reset form instead of login/signup
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (token) {
    loginForm.style.display = 'none';
    signupForm.style.display = 'none';
    forgotForm.style.display = 'none';
    resetForm.style.display = 'flex';
    document.querySelector('.auth-tabs').style.display = 'none';
  }
});

