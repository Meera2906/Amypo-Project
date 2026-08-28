import api from './api'

export const getMyEnrollments = (learnerId) =>
  api.get('/enrollments/my', { params: { learnerId } })

export const enroll = (learnerId, sessionId) =>
  api.post('/enrollments/enroll', null, { params: { learnerId, sessionId } })

export const cancelEnrollment = (learnerId, sessionId) =>
  api.delete('/enrollments/cancel', { params: { learnerId, sessionId } })

export const discontinue = cancelEnrollment
