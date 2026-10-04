import axios from '../axios/axios.js';

export async function createBooking({ listingId, startTime, endTime, quantity, paymentMethod }) {
  const res = await axios.post('/api/bookings', {
    listingId,
    startTime,
    endTime,
    quantity,
    paymentMethod,
  });
  return res.data;
}

export async function getMyBookings() {
  const res = await axios.get('/api/bookings/me');
  return res.data;
}

export async function getOwnerBookings() {
  const res = await axios.get('/api/bookings/owner');
  return res.data;
}

export async function getBookingById(id) {
  const res = await axios.get(`/api/bookings/${id}`);
  return res.data;
}

export async function cancelBooking(id) {
  const res = await axios.patch(`/api/bookings/${id}/cancel`);
  return res.data;
}

export async function markCashPaymentReceived(id) {
  const res = await axios.patch(`/api/bookings/${id}/mark-paid`);
  return res.data;
}

export async function getBookedSlots(listingId) {
  const res = await axios.get(`/api/bookings/listing/${listingId}/booked-slots`);
  return res.data;
}
export async function markRefunded(id) {
  const res = await axios.patch(`/api/bookings/${id}/mark-refunded`);
  return res.data;
}