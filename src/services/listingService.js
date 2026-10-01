import axios from '../axios/axios.js';

export async function getListingById(id) {
  const res = await axios.get(`/api/v1/listings/${id}`);
  return res.data;
}