import axios, { InternalAxiosRequestConfig } from 'axios';
import router from '@/router';
import { useSessionVault } from '@/composables/session-vault';
import { useAuth } from '@/composables/auth';

const { clearSession } = useSessionVault();

const baseURL = 'https://cs-demo-api.herokuapp.com';

const client = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const { getAccessToken } = useAuth();
  const token = await getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      clearSession().then(() => router.replace('/login'));
    }
    return Promise.reject(error);
  }
);

export const useBackendAPI = () => {
  return {
    client,
  };
};
