import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3333',
});

// Este "interceptor" funciona como um carteiro automático.
// Antes de qualquer requisição sair do Frontend, ele verifica se existe um token salvo.
// Se existir, ele anexa o "Bearer token" no cabeçalho automaticamente!
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@ClassPlus:token');
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});