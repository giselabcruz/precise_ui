import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api/v1', // change if needed
  headers: {
    'Content-Type': 'application/json',
  },
});
