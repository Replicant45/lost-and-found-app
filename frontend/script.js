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
    checkForUpdates(allItems);
    renderItems(allItems);
  } catch (err) {
    container.innerHTML = '<p>Failed to load items. Is the backend server running?</p>';
    console.error(err);
  }
}

// --- NEW-SINCE-LAST-VISIT NOTIFICATION ---
function checkForUpdates(items) {
  const STORAGE_KEY = 'lf_last_seen_items';
  const previousRaw = localStorage.getItem(STORAGE_KEY);
  const previous = previousRaw ? JSON.parse(previousRaw) : null;

  // Build a quick lookup of current items' id -> status
  const currentSnapshot = items.map(item => ({ id: item._id, status: item.status }));

  if (previous) {
    const previousMap = {};
    previous.forEach(p => { previousMap[p.id] = p.status; });

    const newItems = items.filter(item => !(item._id in previousMap));
    const newlyResolved = items.filter(item =>
      item._id in previousMap &&
      previousMap[item._id] === 'open' &&
      item.status === 'resolved'
    );

    showUpdateBanner(newItems.length, newlyResolved.length);
  }

  // Save current snapshot for next visit
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSnapshot));
}

function showUpdateBanner(newCount, resolvedCount) {
  const existing = document.getElementById('update-banner');
  if (existing) existing.remove();

  if (newCount === 0 && resolvedCount === 0) return;

  const parts = [];
  if (newCount > 0) parts.push(`${newCount} new item${newCount > 1 ? 's' : ''} posted`);
  if (resolvedCount > 0) parts.push(`${resolvedCount} item${resolvedCount > 1 ? 's' : ''} marked resolved`);

  const banner = document.createElement('div');
  banner.id = 'update-banner';
  banner.className = 'update-banner';
  banner.innerHTML = `
    <span>🔔 ${parts.join(' · ')} since your last visit</span>
    <button id="dismiss-banner" aria-label="Dismiss">✕</button>
  `;

  const main = document.querySelector('main');
  main.insertBefore(banner, main.firstChild);

  document.getElementById('dismiss-banner').addEventListener('click', () => {
    banner.remove();
  });
}

function renderItems(items) {
  const container = document.getElementById('items-container');

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3>Nothing here yet</h3>
        <p>No items match your search — try a different keyword, or be the first to post one.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map((item, index) => `
    <div class="item-card ${item.status === 'resolved' ? 'resolved' : ''}" style="animation-delay: ${index * 0.06}s">
      ${item.imageUrl ? `<img src="${item.imageUrl}" class="item-image" alt="${item.title}">` : ''}
      <span class="tag ${item.type}">${item.type.toUpperCase()}</span>
      
      ${item.status === 'resolved' ? '<span class="tag resolved-tag">RESOLVED</span>' : ''}
      <h3>${item.title}</h3>
    <p class="description">${item.description}</p>

      <p><strong>Category:</strong> ${item.category} · <strong>Location:</strong> ${item.location}</p>
      <p><strong>Date:</strong> ${new Date(item.date).toLocaleDateString()} · <strong>Contact:</strong> ${item.contactInfo}</p>
    ${(user && (user.id === item.postedBy || user.isAdmin)) ? `
  <div class="card-actions">
    ${item.status === 'open' ? `<button class="btn-small resolve-btn" data-id="${item._id}">Mark Resolved</button>` : ''}
    <button class="btn-small delete-btn" data-id="${item._id}">Delete</button>
  </div>
` : ''}

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


