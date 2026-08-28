import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import sessionReducer from './slices/sessionSlice'
import subjectReducer from './slices/subjectSlice'
import enrollmentReducer from './slices/enrollmentSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sessions: sessionReducer,
    subjects: subjectReducer,
    enrollments: enrollmentReducer,
  },
})

export default store
