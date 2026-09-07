import api from './api'
import mockStore from './mockDataStore'

export const submitFeedback = async (payload) => {
  try {
    const res = await api.post('/feedback', null, { params: payload })
    mockStore.submitFeedback(payload)
    return res?.data !== undefined ? res.data : res
  } catch (err) {
    return mockStore.submitFeedback(payload)
  }
}

export const getAllFeedback = async () => {
  try {
    const res = await api.get('/feedback')
    const data = res?.data !== undefined ? res.data : res
    if (Array.isArray(data) && data.length > 0) {
      return data
    }
    return mockStore.getFeedbacks()
  } catch (err) {
    return mockStore.getFeedbacks()
  }
}

const feedbackService = {
  submitFeedback,
  getAllFeedback,
}

export default feedbackService



