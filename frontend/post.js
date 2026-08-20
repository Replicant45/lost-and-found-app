const API_URL = 'http://localhost:5000/api/items';

const form = document.getElementById('item-form');
const message = document.getElementById('form-message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const token = localStorage.getItem('token');

  if (!token) {
    message.textContent = 'Please login first to post an item.';
    message.style.color = 'red';
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

    message.textContent = 'Item posted successfully!';
    message.style.color = 'green';
    form.reset();

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);

  } catch (err) {
    message.textContent = 'Something went wrong. Please try again.';
    message.style.color = 'red';
    console.error(err);
  }
});
