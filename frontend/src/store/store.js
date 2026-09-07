import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import sessionReducer from './sessionSlice'
import subjectReducer from './subjectSlice'
import enrollmentReducer from './enrollmentSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sessions: sessionReducer,
    subjects: subjectReducer,
    enrollments: enrollmentReducer,
  },
})

export default store
