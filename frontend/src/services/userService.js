import api from './api'

export const getMentors = () => api.get('/users/mentors')
export const getStats = () => api.get('/analytics/stats')
export const getMentorStats = (id) => api.get(`/analytics/mentor/${id}`)
