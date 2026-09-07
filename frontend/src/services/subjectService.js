import api from './api'
import mockStore from './mockDataStore'

export const getAll = async () => {
  try {
    const res = await api.get('/subjects')
    const data = res?.content !== undefined ? res.content : (res?.data !== undefined ? res.data : res)
    if (Array.isArray(data) && data.length > 0) {
      return data
    }
    return mockStore.getSubjects()
  } catch (err) {
    return mockStore.getSubjects()
  }
}

export const create = async (data) => {
  try {
    const res = await api.post('/subjects', data)
    mockStore.createSubject(data)
    return res?.data !== undefined ? res.data : res
  } catch (err) {
    return mockStore.createSubject(data)
  }
}

export const update = async (id, data) => {
  try {
    const res = await api.put(`/subjects/${id}`, data)
    mockStore.updateSubject(id, data)
    return res?.data !== undefined ? res.data : res
  } catch (err) {
    return mockStore.updateSubject(id, data)
  }
}

export const deleteSubject = async (id) => {
  try {
    const res = await api.delete(`/subjects/${id}`)
    mockStore.deleteSubject(id)
    return res?.data !== undefined ? res.data : res
  } catch (err) {
    return mockStore.deleteSubject(id)
  }
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



