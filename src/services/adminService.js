import adminApi from '../axios/adminAxios.js';

const BASE = '/api/v1/super-admin';

export async function getPendingListings() {
  const res = await adminApi.get(`${BASE}/listings/pending`);
  return res.data;
}

export async function approveListing(id) {
  await adminApi.post(`${BASE}/listings/${id}/approve`);
}

export async function rejectListing(id) {
  await adminApi.post(`${BASE}/listings/${id}/reject`);
}

export async function getAllUsers() {
  const res = await adminApi.get(`${BASE}/users`);
  return res.data;
}