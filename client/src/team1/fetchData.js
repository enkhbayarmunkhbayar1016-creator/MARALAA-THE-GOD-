// src/team1/connections/fetchData.js
import api from './api';

export const fetchData = async (url, options = {}) => {
  // URL-аас замыг нь салгаж авах (/users/me гэх мэт)
  const path = url.includes('/v1') ? url.split('/v1')[1] : url;
  const method = options.method || 'GET';
  
  // JSON body-г объект болгож хувиргах
  let data = undefined;
  if (options.body) {
    try { data = JSON.parse(options.body); } catch(e) { data = options.body; }
  }


  return await api[method.toLowerCase()](path, data);
};

export default fetchData;