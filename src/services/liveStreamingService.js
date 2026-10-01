import axios from '../axios/axios.js';

export async function startStream(bookingId) {
  const res = await axios.post(`/api/livestreams/${bookingId}/start`);
  return res.data;
}

export async function endStream(bookingId) {
  const res = await axios.post(`/api/livestreams/${bookingId}/end`);
  return res.data;
}

export async function getActiveStreams() {
  const res = await axios.get('/api/livestreams/active');
  return res.data;
}

export async function getStreamByBooking(bookingId) {
  const res = await axios.get(`/api/livestreams/${bookingId}`);
  return res.data;
}