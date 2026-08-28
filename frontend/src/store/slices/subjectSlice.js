import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as subjectService from '../../services/subjectService'

const initialState = {
  items: [],
  loading: false,
  error: null,
}

export const fetchSubjects = createAsyncThunk('subjects/fetchSubjects', async (_, { rejectWithValue }) => {
  try {
    const response = await subjectService.getAll()
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to load subjects')
  }
})

const subjectSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubjects.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Unable to load subjects'
      })
  },
})

export default subjectSlice.reducer
