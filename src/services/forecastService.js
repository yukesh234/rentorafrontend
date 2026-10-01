import axios from '../axios/axios.js';

export async function getForecast({ listingId, festival, promo, schoolHoliday }) {
  const params = new URLSearchParams();
  if (listingId) params.append('listingId', listingId);
  params.append('festival', festival);
  params.append('promo', promo);
  params.append('schoolHoliday', schoolHoliday);
  const res = await axios.get(`/api/forecast?${params.toString()}`);
  return res.data;
}