import api from './api'
import mockStore from './mockDataStore'

export const getMyEnrollments = async (learnerId) => {
  try {
    const res = await api.get('/enrollments/my', { params: { learnerId } })
    const data = res?.content !== undefined
      ? res.content
      : (res?.data !== undefined ? res.data : res)
    if (Array.isArray(data)) {
      return data
    }
    return mockStore.getEnrollmentsForLearner(learnerId)
  } catch (err) {
    return mockStore.getEnrollmentsForLearner(learnerId)
  }
}

export const enroll = async (learnerId, sessionId) => {
  try {
    const res = await api.post('/enrollments/enroll', null, { params: { learnerId, sessionId } })
    mockStore.enrollLearner(learnerId, sessionId)
    return res?.data !== undefined ? res.data : res
  } catch (err) {
    return mockStore.enrollLearner(learnerId, sessionId)
  }
}

export const cancelEnrollment = async (learnerId, sessionId) => {
  try {
    const res = await api.delete('/enrollments/cancel', { params: { learnerId, sessionId } })
    mockStore.cancelEnrollment(learnerId, sessionId)
    return res?.data !== undefined ? res.data : res
  } catch (err) {
    return mockStore.cancelEnrollment(learnerId, sessionId)
  }
}

export const discontinue = cancelEnrollment

const enrollmentService = {
  getMyEnrollments,
  enroll,
  cancelEnrollment,
  discontinue,
}

export default enrollmentService



