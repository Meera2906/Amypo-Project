import api from './api'

export const submitFeedback = (payload) => api.post('/feedback', null, { params: payload })
export const getAllFeedback = () => api.get('/feedback')

const feedbackService = {
  submitFeedback,
  getAllFeedback,
}

export default feedbackService

