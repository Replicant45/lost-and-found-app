const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

function updateAuthUI() {
  const headerActions = document.querySelector('header');
  const existingAuth = document.getElementById('auth-status');
  if (existingAuth) existingAuth.remove();

  const authDiv = document.createElement('div');
  authDiv.id = 'auth-status';

  if (user) {
    authDiv.innerHTML = `
      <span class="user-greeting">Hi, ${user.name}</span>
      <button id="logout-btn" class="btn-small delete-btn">Logout</button>
    `;
    headerActions.appendChild(authDiv);

    document.getElementById('logout-btn').addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    });
  } else {
    authDiv.innerHTML = `<a href="auth.html" class="btn">Login / Signup</a>`;
    headerActions.appendChild(authDiv);
  }
}

updateAuthUI();




// const API_URL = 'http://localhost:5000/api/items';
const API_URL = 'https://lost-and-found-app-ud84.onrender.com/api/items';

let allItems = []; // store all items so we can filter without re-fetching

async function loadItems() {
  const container = document.getElementById('items-container');

  try {
    const res = await fetch(API_URL);
    allItems = await res.json();
    renderItems(allItems);
  } catch (err) {
    container.innerHTML = '<p>Failed to load items. Is the backend server running?</p>';
    console.error(err);
  }
}

function renderItems(items) {
  const container = document.getElementById('items-container');

  if (items.length === 0) {
    container.innerHTML = '<p>No items found.</p>';
    return;
  }

 container.innerHTML = items.map(item => `
    <div class="item-card ${item.status === 'resolved' ? 'resolved' : ''}">
      ${item.imageUrl ? `<img src="${item.imageUrl}" class="item-image" alt="${item.title}">` : ''}
      <span class="tag ${item.type}">${item.type.toUpperCase()}</span>
      
      ${item.status === 'resolved' ? '<span class="tag resolved-tag">RESOLVED</span>' : ''}
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <p><strong>Category:</strong> ${item.category}</p>
      <p><strong>Location:</strong> ${item.location}</p>
      <p><strong>Date:</strong> ${new Date(item.date).toLocaleDateString()}</p>
      <p><strong>Contact:</strong> ${item.contactInfo}</p>
      <div class="card-actions">
        ${item.status === 'open' ? `<button class="btn-small resolve-btn" data-id="${item._id}">Mark Resolved</button>` : ''}
        <button class="btn-small delete-btn" data-id="${item._id}">Delete</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.resolve-btn').forEach(btn => {
    btn.addEventListener('click', () => markResolved(btn.dataset.id));
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteItem(btn.dataset.id));
  });
}

async function markResolved(id) {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'resolved' })
    });
    loadItems();
  } catch (err) {
    console.error('Failed to mark resolved', err);
  }
}

async function deleteItem(id) {
  const confirmed = confirm('Delete this item permanently?');
  if (!confirmed) return;

  try {
    await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    loadItems();
  } catch (err) {
    console.error('Failed to delete item', err);
  }
}

function applyFilters() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const typeFilter = document.getElementById('type-filter').value;

  let filtered = allItems;

  if (typeFilter !== 'all') {
    filtered = filtered.filter(item => item.type === typeFilter);
  }

  if (searchTerm) {
    filtered = filtered.filter(item =>
      item.title.toLowerCase().includes(searchTerm) ||
      item.location.toLowerCase().includes(searchTerm)
    );
  }

  renderItems(filtered);
}

document.getElementById('search-input').addEventListener('input', applyFilters);
document.getElementById('type-filter').addEventListener('change', applyFilters);

loadItems();
