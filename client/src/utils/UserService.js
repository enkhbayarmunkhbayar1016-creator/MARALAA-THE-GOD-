import { fetchData } from './fetchData';

const BASE_URL = "https://todu.mn/bs/lms/v1";

export const getToken = () => localStorage.getItem('access_token')

export const load = async () =>
  fetchData(`${BASE_URL}/users/me`, 'GET', undefined, true)

export const register = (registerDTO) =>
  fetchData(`${BASE_URL}/users`, 'POST', registerDTO, true)

export const updateProfile = async (registerDTO) =>
  fetchData(`${BASE_URL}/users/me`, 'PUT', registerDTO, true)

export const logIn = (loginDTO) =>
  fetch(`${BASE_URL}/token/email`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginDTO)
    }
  )

export const logOut = () =>
  fetch(`${BASE_URL}/token`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: '{}'
    }
  )