import axios from '../axios/axios.js';

function buildParams({ listingId, startDate, endDate } = {}) {
  const params = new URLSearchParams();
  if (listingId) params.append('listingId', listingId);
  if (startDate) params.append('startDate', startDate.toISOString());
  if (endDate) params.append('endDate', endDate.toISOString());
  return params.toString();
}

export async function getSummary(filters) {
  console.log("for get summary",filters)
  const res = await axios.get(`/api/analytics/summary?${buildParams(filters)}`);
  return res.data;
}

export async function getBookingsOverTime(filters) {
  console.log(filters)
  const res = await axios.get(`/api/analytics/bookings-over-time?${buildParams(filters)}`);
  return res.data;
}

export async function getCategoryBreakdown(filters) {
  console.log(filters)
  const res = await axios.get(`/api/analytics/category-breakdown?${buildParams(filters)}`);
  return res.data;
}

export async function getTopListings(limit = 5) {
  const res = await axios.get(`/api/analytics/top-listings?limit=${limit}`);
  return res.data;
}

export async function getListingOptions() {
  const res = await axios.get('/api/analytics/listing-options');
  return res.data;
}