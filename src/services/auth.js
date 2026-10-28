import { ref } from 'vue';
import { api, TOKEN_KEY, USER_KEY } from './api';

function readStoredUser() {
  const saved = localStorage.getItem(USER_KEY);

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    return null;
  }
}

export const currentUser = ref(readStoredUser());

function saveSession(response) {
  localStorage.setItem(TOKEN_KEY, response.token);
  localStorage.setItem(USER_KEY, JSON.stringify(response.user));
  currentUser.value = response.user;
}

export function isLoggedIn() {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  saveSession(data);
  return data;
}

export async function register(name, email, password) {
  const { data } = await api.post('/auth/register', { name, email, password });
  saveSession(data);
  return data;
}

export async function forgotPassword(email) {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
}

export async function resetPassword(token, password) {
  const { data } = await api.post('/auth/reset-password', { token, password });
  return data;
}

export async function getProfile() {
  const { data } = await api.get('/users/profile');
  return data;
}

export async function updateProfile(name, email) {
  const { data } = await api.put('/users/profile', { name, email });
  localStorage.setItem(USER_KEY, JSON.stringify(data));
  currentUser.value = data;
  return data;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  currentUser.value = null;
}
