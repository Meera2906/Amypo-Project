import api from './api'
import mockStore from './mockDataStore'

export const getMentors = async () => {
  try {
    const res = await api.get('/users/mentors')
    const data = res?.data !== undefined ? res.data : res
    if (Array.isArray(data) && data.length > 0) {
      return data
    }
    return mockStore.getMentors()
  } catch (err) {
    return mockStore.getMentors()
  }
}

export const getStats = async () => {
  try {
    const res = await api.get('/analytics/stats')
    const data = res?.data !== undefined ? res.data : res
    if (data && (data.totalLearners !== undefined || data.totalMentors !== undefined)) {
      return data
    }
    return mockStore.getStats()
  } catch (err) {
    return mockStore.getStats()
  }
}

export const getMentorStats = async (id) => {
  try {
    const res = await api.get(`/analytics/mentor/${id}`)
    const data = res?.data !== undefined ? res.data : res
    if (data && (data.averageRating !== undefined || data.totalSessions !== undefined)) {
      return data
    }
    return mockStore.getMentorStats(id)
  } catch (err) {
    return mockStore.getMentorStats(id)
  }
}

export const updateMentorStatus = async (id, status, email) => {
  try {
    const res = await api.put(`/users/${id}/status`, null, { params: { status } })
    mockStore.updateMentorStatus(id, status, email)
    return res?.data !== undefined ? res.data : res
  } catch (err) {
    return mockStore.updateMentorStatus(id, status, email)
  }
}

const userService = {
  getMentors,
  getStats,
  getMentorStats,
  updateMentorStatus,
}

export default userService

