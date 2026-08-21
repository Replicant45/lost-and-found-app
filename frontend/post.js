function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

// const API_URL = 'http://localhost:5000/api/items';
const API_URL = 'https://lost-and-found-app-ud84.onrender.com/api/items';

const form = document.getElementById('item-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const token = localStorage.getItem('token');

  if (!token) {
    showToast('Please login first to post an item.', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('type', document.getElementById('type').value);
  formData.append('title', document.getElementById('title').value);
  formData.append('description', document.getElementById('description').value);
  formData.append('category', document.getElementById('category').value);
  formData.append('location', document.getElementById('location').value);
  formData.append('date', document.getElementById('date').value);
  formData.append('contactInfo', document.getElementById('contactInfo').value);

  const imageFile = document.getElementById('image').files[0];
  if (imageFile) {
    formData.append('image', imageFile);
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Note: no 'Content-Type' header here — the browser sets it
        // automatically for FormData, including the required boundary
      },
      body: formData
    });

    if (!res.ok) throw new Error('Failed to submit item');

    showToast('Item posted successfully!', 'success');
    form.reset();

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);

  } catch (err) {
    showToast('Something went wrong. Please try again.', 'error');
    console.error(err);
  }
});
