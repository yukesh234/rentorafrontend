import axios from '../axios/axios.js';

export async function initiatePayment(bookingId) {
  const res = await axios.post('/api/payments/initiate', { bookingId });
  return res.data; // { paymentUrl, formFields, transactionUuid }
}