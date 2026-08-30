import api from './api'

export const getAll = async () => {
  const res = await api.get('/subjects')
  return res?.data !== undefined ? res.data : res
}

export const create = async (data) => {
  const res = await api.post('/subjects', data)
  return res?.data !== undefined ? res.data : res
}

export const update = async (id, data) => {
  const res = await api.put(`/subjects/${id}`, data)
  return res?.data !== undefined ? res.data : res
}

export const deleteSubject = async (id) => {
  const res = await api.delete(`/subjects/${id}`)
  return res?.data !== undefined ? res.data : res
}

export { deleteSubject as delete }

const subjectService = {
  getAll,
  getSubjects: getAll,
  create,
  update,
  deleteSubject,
  delete: deleteSubject,
}

export default subjectService


