import api from './api'

export const getAll = () => api.get('/subjects')
export const create = (data) => api.post('/subjects', data)
export const update = (id, data) => api.put(`/subjects/${id}`, data)
export const deleteSubject = (id) => api.delete(`/subjects/${id}`)
