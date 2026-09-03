import api from './api'

export const getMentors = async () => {
  const res = await api.get('/users/mentors')
  return res?.data !== undefined ? res.data : res
}

export const getStats = async () => {
  const res = await api.get('/analytics/stats')
  return res?.data !== undefined ? res.data : res
}

export const getMentorStats = async (id) => {
  const res = await api.get(`/analytics/mentor/${id}`)
  return res?.data !== undefined ? res.data : res
}

export const updateMentorStatus = async (id, status) => {
  const res = await api.put(`/users/${id}/status`, null, { params: { status } })
  return res?.data !== undefined ? res.data : res
}

const userService = {
  getMentors,
  getStats,
  getMentorStats,
  updateMentorStatus,
}

export default userService
