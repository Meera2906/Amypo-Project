import api from './api'

export const submitFeedback = async (payload) => {
  const res = await api.post('/feedback', null, { params: payload })
  return res?.data !== undefined ? res.data : res
}

export const getAllFeedback = async () => {
  const res = await api.get('/feedback')
  return res?.data !== undefined ? res.data : res
}

const feedbackService = {
  submitFeedback,
  getAllFeedback,
}

export default feedbackService


