import { axiosInstance } from './https';

export const login = async (data: { dni: string; password: string }) => {
  const response = await axiosInstance.post('/auth/login', data);
  return response.data;
};

export const register = async (data: { dni: string; password: string }) => {
  const response = await axiosInstance.post('/auth/register', data);
  return response.data;
};
