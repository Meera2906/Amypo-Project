import api from './api'

export const getMyEnrollments = async (learnerId) => {
  const res = await api.get('/enrollments/my', { params: { learnerId } })
  return res?.data !== undefined ? res.data : res
}

export const enroll = async (learnerId, sessionId) => {
  const res = await api.post('/enrollments/enroll', null, { params: { learnerId, sessionId } })
  return res?.data !== undefined ? res.data : res
}

export const cancelEnrollment = async (learnerId, sessionId) => {
  const res = await api.delete('/enrollments/cancel', { params: { learnerId, sessionId } })
  return res?.data !== undefined ? res.data : res
}

export const discontinue = cancelEnrollment

const enrollmentService = {
  getMyEnrollments,
  enroll,
  cancelEnrollment,
  discontinue,
}

export default enrollmentService


