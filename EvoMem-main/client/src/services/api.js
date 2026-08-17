export const SERVER_BASE = import.meta.env.VITE_SERVER_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://ekagraai-backend.onrender.com');
const API_BASE = `${SERVER_BASE}/api`;

function getAuthHeader() {
  const token = localStorage.getItem('ekagra_admin_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function loginAdmin(identity, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity, password })
  });
  return res.json();
}

export async function checkAuth() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeader()
  });
  return res.json();
}

export async function fetchProjectMeta() {
  const res = await fetch(`${API_BASE}/project`);
  return res.json();
}

export async function updateProjectMeta(data) {
  const res = await fetch(`${API_BASE}/project`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchChanges() {
  const res = await fetch(`${API_BASE}/changes`);
  return res.json();
}

export async function addChange(changeData) {
  const res = await fetch(`${API_BASE}/changes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(changeData)
  });
  return res.json();
}

export async function deleteChange(id) {
  const res = await fetch(`${API_BASE}/changes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  return res.json();
}

export async function fetchPPT() {
  const res = await fetch(`${API_BASE}/ppt`);
  return res.json();
}

export async function uploadPPT(formData) {
  const res = await fetch(`${API_BASE}/ppt/upload`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: formData
  });
  return res.json();
}

export async function deletePPT(id) {
  const url = id ? `${API_BASE}/ppt/${id}` : `${API_BASE}/ppt`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  return res.json();
}

export async function fetchTeam() {
  const res = await fetch(`${API_BASE}/team`);
  return res.json();
}
