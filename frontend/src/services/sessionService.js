import api from './api'

export const getAll = async (page = 0, size = 10) => {
  const res = await api.get('/sessions', { params: { page, size } })
  return res?.data !== undefined ? res.data : res
}

export const create = async (data) => {
  const res = await api.post('/sessions', data)
  return res?.data !== undefined ? res.data : res
}

export const update = async (id, data) => {
  const res = await api.put(`/sessions/${id}`, data)
  return res?.data !== undefined ? res.data : res
}

export const updateStatus = async (id, status) => {
  const res = await api.put(`/sessions/${id}/status`, null, { params: { status } })
  return res?.data !== undefined ? res.data : res
}

export const cancel = async (id) => {
  const res = await api.delete(`/sessions/${id}`)
  return res?.data !== undefined ? res.data : res
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


