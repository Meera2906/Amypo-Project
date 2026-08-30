import api from './api'

export const getAll = (page = 0, size = 10) =>
  api.get('/sessions', {
    params: { page, size },
  })

export const create = (data) => api.post('/sessions', data)
export const update = (id, data) => api.put(`/sessions/${id}`, data)
export const updateStatus = (id, status) =>
  api.put(`/sessions/${id}/status`, null, { params: { status } })
export const cancel = (id) => api.delete(`/sessions/${id}`)

const sessionService = {
  getAll,
  create,
  update,
  updateStatus,
  cancel,
}

export default sessionService

