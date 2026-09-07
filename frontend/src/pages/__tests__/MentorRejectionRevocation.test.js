import mockStore from '../../services/mockDataStore'
import { login } from '../../services/authService'
import api from '../../services/api'

jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}))

describe('Mentor Rejection and Revocation Login Prevention', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
    // By default simulate offline / reject to trigger mockStore
    api.post.mockRejectedValue(new Error('Network Error'))
  })

  test('Approved mentor can log in successfully via mock store', async () => {
    mockStore.updateMentorStatus(2, 'APPROVED', 'mentor@loomlearn.com')
    const user = mockStore.findUserByEmail('mentor@loomlearn.com')
    expect(user.status).toBe('APPROVED')

    const authData = await login({ email: 'mentor@loomlearn.com', password: 'password123' })
    expect(authData).toBeDefined()
    expect(authData.email).toBe('mentor@loomlearn.com')
    expect(authData.role).toBe('MENTOR')
  })

  test('Rejected mentor cannot log in and receives Access denied message', async () => {
    // Admin rejects mentor
    mockStore.updateMentorStatus(2, 'REJECTED', 'mentor@loomlearn.com')
    const user = mockStore.findUserByEmail('mentor@loomlearn.com')
    expect(user.status).toBe('REJECTED')

    // Attempt login as rejected mentor
    await expect(
      login({ email: 'mentor@loomlearn.com', password: 'password123' })
    ).rejects.toThrow('Mentor application was rejected. Access denied.')
  })

  test('Revoked / Blocked mentor cannot log in and receives Access denied message', async () => {
    // Admin revokes / blocks mentor
    mockStore.updateMentorStatus(2, 'BLOCKED', 'mentor@loomlearn.com')
    const user = mockStore.findUserByEmail('mentor@loomlearn.com')
    expect(user.status).toBe('BLOCKED')

    // Attempt login as revoked mentor
    await expect(
      login({ email: 'mentor@loomlearn.com', password: 'password123' })
    ).rejects.toThrow('Mentor account has been revoked or blocked. Access denied.')
  })

  test('Explicit REVOKED status prevents mentor from logging in', async () => {
    // Admin revokes mentor with REVOKED status
    mockStore.updateMentorStatus(2, 'REVOKED', 'mentor@loomlearn.com')
    const user = mockStore.findUserByEmail('mentor@loomlearn.com')
    expect(user.status).toBe('REVOKED')

    // Attempt login as revoked mentor
    await expect(
      login({ email: 'mentor@loomlearn.com', password: 'password123' })
    ).rejects.toThrow('Mentor account has been revoked or blocked. Access denied.')
  })

  test('Pending mentor cannot log in until approved', async () => {
    mockStore.updateMentorStatus(2, 'PENDING', 'mentor@loomlearn.com')
    const user = mockStore.findUserByEmail('mentor@loomlearn.com')
    expect(user.status).toBe('PENDING')

    await expect(
      login({ email: 'mentor@loomlearn.com', password: 'password123' })
    ).rejects.toThrow('Mentor application is pending review. Please wait for approval.')
  })

  test('Re-approving mentor restores login access', async () => {
    // 1. Revoke mentor
    mockStore.updateMentorStatus(2, 'BLOCKED', 'mentor@loomlearn.com')
    await expect(
      login({ email: 'mentor@loomlearn.com', password: 'password123' })
    ).rejects.toThrow('Mentor account has been revoked or blocked. Access denied.')

    // 2. Admin re-approves mentor
    mockStore.updateMentorStatus(2, 'APPROVED', 'mentor@loomlearn.com')
    const authData = await login({ email: 'mentor@loomlearn.com', password: 'password123' })
    expect(authData).toBeDefined()
    expect(authData.email).toBe('mentor@loomlearn.com')
    expect(authData.role).toBe('MENTOR')
  })

  test('Backend rejection error message is propagated directly without fallback bypass', async () => {
    const errorResponse = {
      response: {
        status: 400,
        data: { message: 'Mentor application was rejected. Access denied.' },
      },
    }
    api.post.mockRejectedValue(errorResponse)

    await expect(
      login({ email: 'mentor@loomlearn.com', password: 'password123' })
    ).rejects.toThrow('Mentor application was rejected. Access denied.')
  })
})
