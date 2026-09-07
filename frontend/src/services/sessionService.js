import api from './api'
import mockStore from './mockDataStore'

export const getAll = async (page = 0, size = 200, mentorId = null) => {
  try {
    const params = { page, size }
    if (mentorId != null && mentorId !== '' && mentorId !== 'ALL') {
      params.mentorId = mentorId
    }
    const res = await api.get('/sessions', { params })
    const data = res?.content !== undefined
      ? res.content
      : (res?.data?.content !== undefined
        ? res.data.content
        : (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])))
    if (Array.isArray(data) && data.length > 0) {
      return data
    }
    return mockStore.getSessions(mentorId)
  } catch (err) {
    return mockStore.getSessions(mentorId)
  }
}

export const create = async (data) => {
  try {
    const res = await api.post('/sessions', data)
    const saved = res?.data !== undefined ? res.data : res
    mockStore.createSession(saved || data)
    return saved
  } catch (err) {
    return mockStore.createSession(data)
  }
}

export const update = async (id, data) => {
  try {
    const res = await api.put(`/sessions/${id}`, data)
    mockStore.updateSession(id, data)
    return res?.data !== undefined ? res.data : res
  } catch (err) {
    return mockStore.updateSession(id, data)
  }
}

export const updateStatus = async (id, status) => {
  try {
    const res = await api.put(`/sessions/${id}/status`, null, { params: { status } })
    mockStore.updateSessionStatus(id, status)
    return res?.data !== undefined ? res.data : res
  } catch (err) {
    return mockStore.updateSessionStatus(id, status)
  }
}

export const cancel = async (id) => {
  try {
    const res = await api.delete(`/sessions/${id}`)
    mockStore.deleteSession(id)
    return res?.data !== undefined ? res.data : res
  } catch (err) {
    return mockStore.deleteSession(id)
  }
}

export { cancel as delete }
export { cancel as deleteSession }

const sessionService = {
  getAll,
  create,
  update,
  updateStatus,
  cancel,
  delete: cancel,
  deleteSession: cancel,
}

export default sessionService



