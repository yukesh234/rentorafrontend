import axios from '../axios/axios.js';

// groupBy: 'category' (default) or 'listing' (one forecast per product)
export async function getForecast({ listingId, festival, promo, schoolHoliday, groupBy = 'category' }) {
  const params = new URLSearchParams();
  if (listingId) params.append('listingId', listingId);
  params.append('festival', festival);
  params.append('promo', promo);
  params.append('schoolHoliday', schoolHoliday);
  params.append('groupBy', groupBy);
  const res = await axios.get(`/api/forecast?${params.toString()}`);
  return res.data;
}