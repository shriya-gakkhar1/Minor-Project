import axios from 'axios';

export const getPlacements = async () => {
  const res = await axios.get('http://localhost:5000/api/placements');
  return res.data;
};