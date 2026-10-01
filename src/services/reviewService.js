import axios from "../axios/axios";

export async function submitReview({ bookingId, rating, comment }) {
  const res = await axios.post('/api/reviews', { bookingId, rating, comment });
  return res.data;
}

export async function getReviewsForListing(listingId) {
  const res = await axios.get(`/api/reviews/listing/${listingId}`);
  return res.data;
}