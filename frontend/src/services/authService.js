import api from './api'

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials)
  const data = response?.data !== undefined ? response.data : response
  if (data && !data.user && (data.role || data.fullName)) {
    data.user = {
      id: data.id,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
    }
  }
  return data
}

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData)
  const data = response?.data !== undefined ? response.data : response
  if (data && !data.user && (data.role || data.fullName)) {
    data.user = {
      id: data.id,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
    }
  }
  return data
}

const authService = {
  login,
  register,
}

export default authService


