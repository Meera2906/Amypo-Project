import api from './api'

export const login = (credentials) => api.post('/auth/login', credentials)
export const register = (userData) => api.post('/auth/register', userData)

const authService = {
  login,
  register,
}

export default authService

