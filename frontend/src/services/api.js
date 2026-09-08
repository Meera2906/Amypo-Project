import axios from 'axios'

let backendOfflineUntil = 0

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 2000,
})

api.interceptors.request.use((config) => {
  // If backend recently failed with network error, fail immediately to prevent lag
  if (Date.now() < backendOfflineUntil) {
    return Promise.reject(new Error('Backend temporarily offline (fast fail)'))
  }
  const token = localStorage.getItem('loom_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    backendOfflineUntil = 0
    return response
  },
  (error) => {
    // If backend connection timed out, refused, or had a network failure
    if (!error.response || error.code === 'ECONNABORTED' || error.message?.includes('Network Error')) {
      backendOfflineUntil = Date.now() + 8000 // fast fail for 8s
    }
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('loom_token')
      localStorage.removeItem('loom_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
