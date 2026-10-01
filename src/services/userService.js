import axios from '../axios/axios.js';

export async function getProfile() {
  const res = await axios.get('/api/v1/users/me');
  return res.data;
}

export async function updateProfile({ name }) {
  const res = await axios.put('/api/v1/users/me', { name });
  return res.data;
}

export async function uploadProfilePicture(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await axios.post('/api/v1/users/me/profile-picture', fd);
  return res.data;
}

export async function changePassword({ currentPassword, newPassword }) {
  const res = await axios.patch('/api/v1/users/me/password', {
    currentPassword,
    newPassword,
  });
  return res.data;
}