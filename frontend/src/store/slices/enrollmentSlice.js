import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as enrollmentService from '../../services/enrollmentService'

const initialState = {
  items: [],
  loading: false,
  error: null,
}

export const enrollInSession = createAsyncThunk(
  'enrollments/enrollInSession',
  async ({ learnerId, sessionId }, { rejectWithValue }) => {
    try {
      const response = await enrollmentService.enroll(learnerId, sessionId)
      return { status: response.status, message: response.data, sessionId }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Enrollment failed')
    }
  }
)

const enrollmentSlice = createSlice({
  name: 'enrollments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(enrollInSession.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(enrollInSession.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(enrollInSession.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Enrollment failed'
      })
  },
})

export default enrollmentSlice.reducer
