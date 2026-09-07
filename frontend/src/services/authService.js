import api from './api'
import mockStore from './mockDataStore'

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials)
    const data = response?.data !== undefined ? response.data : response
    if (data && !data.user && (data.role || data.fullName)) {
      data.user = {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
      }
    }
    return data
  } catch (error) {
    // Check mock store fallback for demo accounts & offline testing
    const mockUser = mockStore.findUserByEmail(credentials?.email)
    if (mockUser) {
      if (mockUser.status === 'BLOCKED') {
        throw new Error('Account is blocked. Please contact support.')
      }
      if (mockUser.status === 'REJECTED') {
        throw new Error('Account registration was rejected.')
      }
      return {
        id: mockUser.id,
        token: `mock-jwt-token-${mockUser.id}-${Date.now()}`,
        fullName: mockUser.fullName,
        email: mockUser.email,
        role: mockUser.role,
        department: mockUser.department,
        user: {
          id: mockUser.id,
          fullName: mockUser.fullName,
          email: mockUser.email,
          role: mockUser.role,
        },
      }
    }
    throw error
  }
}

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData)
    const data = response?.data !== undefined ? response.data : response
    if (data && !data.user && (data.role || data.fullName)) {
      data.user = {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
      }
    }
    return data
  } catch (error) {
    // Fallback: register in mockStore
    const newId = Date.now()
    const mockUser = {
      id: newId,
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role || 'LEARNER',
      department: userData.department || 'Computer Science',
      bio: userData.bio || '',
      status: userData.role === 'MENTOR' ? 'PENDING' : 'APPROVED',
    }
    mockStore.state.users.push(mockUser)
    mockStore.saveState()
    return {
      id: newId,
      token: `mock-jwt-token-${newId}-${Date.now()}`,
      fullName: mockUser.fullName,
      email: mockUser.email,
      role: mockUser.role,
      user: {
        id: newId,
        fullName: mockUser.fullName,
        email: mockUser.email,
        role: mockUser.role,
      },
    }
  }
}

const authService = {
  login,
  register,
}

export default authService



