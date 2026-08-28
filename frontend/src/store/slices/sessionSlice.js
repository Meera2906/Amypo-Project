import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as sessionService from '../../services/sessionService'

const initialState = {
  items: [],
  loading: false,
  error: null,
  totalPages: 0,
  currentPage: 0,
}

export const fetchSessions = createAsyncThunk('sessions/fetchSessions', async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
  try {
    const response = await sessionService.getAll(page, size)
    return {
      items: response.data.content || [],
      totalPages: response.data.totalPages || 0,
      currentPage: response.data.number || 0,
    }
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to load sessions')
  }
})

export const createSession = createAsyncThunk('sessions/createSession', async (payload, { rejectWithValue }) => {
  try {
    const response = await sessionService.create(payload)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to create session')
  }
})

const sessionSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.totalPages = action.payload.totalPages
        state.currentPage = action.payload.currentPage
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Unable to load sessions'
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items]
      })
  },
})

export default sessionSlice.reducer
