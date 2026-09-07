import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Provider, useDispatch, useSelector } from 'react-redux'
import store from './store/store'
import { logout } from './store/slices/authSlice'
import mockStore from './services/mockDataStore'
import Navbar from './components/layout/Navbar'
import DotField from './components/DotField'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import SessionList from './pages/SessionList'
import SubjectList from './pages/SubjectList'
import MyEnrollments from './pages/MyEnrollments'
import MentorProfiles from './pages/MentorProfiles'
import SupportDashboard from './pages/SupportDashboard'
import './App.css'

function ProtectedRoute({ children }) {
  const token = useSelector((state) => state.auth.token)
  return token ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const dispatch = useDispatch()
  const token = useSelector((state) => state.auth.token)
  const user = useSelector((state) => state.auth.user)

  // Enforce mentor status: if a logged-in mentor is rejected or revoked/blocked, log them out immediately
  useEffect(() => {
    if (token && user?.role === 'MENTOR') {
      const checkMentorStatus = () => {
        mockStore.syncFromStorage()
        const mentorRecord = mockStore.findUserByEmail(user.email)
        if (
          mentorRecord &&
          (mentorRecord.status === 'REJECTED' ||
            mentorRecord.status === 'BLOCKED' ||
            mentorRecord.status === 'REVOKED')
        ) {
          dispatch(logout())
        }
      }
      checkMentorStatus()
      window.addEventListener('storage', checkMentorStatus)
      return () => window.removeEventListener('storage', checkMentorStatus)
    }
  }, [token, user, dispatch])

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <div className="app-shell">
      <Navbar user={user} />
      <main className="page-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/sessions" element={<SessionList />} />
          <Route path="/subjects" element={<SubjectList />} />
          <Route path="/enrollments" element={<MyEnrollments />} />
          <Route path="/mentors" element={<MentorProfiles />} />
          <Route path="/support" element={<SupportDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="app-root-container">
          <div className="background-dotfield-wrapper">
            <DotField
              dotRadius={3.0}
              dotSpacing={32}
              cursorRadius={180}
              bulgeStrength={80}
              waveAmplitude={0}
              baseColor="rgba(255, 255, 255, 0.20)"
              activeGradientFrom="#93c5fd"
              activeGradientTo="#60a5fa"
              glowColor="#60a5fa"
            />
          </div>
          <AppRoutes />
        </div>
      </BrowserRouter>
    </Provider>
  )
}

export default App
