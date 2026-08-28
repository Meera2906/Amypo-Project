import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { login as loginApi, register as registerApi } from '../../services/authService'

const storedUser = JSON.parse(localStorage.getItem('loom_user') || 'null')
const storedToken = localStorage.getItem('loom_token')

const initialState = {
  user: storedUser,
  token: storedToken,
  loading: false,
  error: null,
}

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await loginApi(credentials)
    const payload = response.data
    localStorage.setItem('loom_token', payload.token)
    localStorage.setItem('loom_user', JSON.stringify({
      id: payload.id,
      fullName: payload.fullName,
      email: payload.email,
      role: payload.role,
    }))
    return payload
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Invalid Credentials.')
  }
})

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await registerApi(userData)
    const payload = response.data
    localStorage.setItem('loom_token', payload.token)
    localStorage.setItem('loom_user', JSON.stringify({
      id: payload.id,
      fullName: payload.fullName,
      email: payload.email,
      role: payload.role,
    }))
    return payload
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Registration failed')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.error = null
      localStorage.removeItem('loom_token')
      localStorage.removeItem('loom_user')
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        state.user = {
          id: action.payload.id,
          fullName: action.payload.fullName,
          email: action.payload.email,
          role: action.payload.role,
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Invalid Credentials.'
      })
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        state.user = {
          id: action.payload.id,
          fullName: action.payload.fullName,
          email: action.payload.email,
          role: action.payload.role,
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Registration failed'
      })
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer
