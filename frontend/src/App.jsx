import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Provider, useSelector } from 'react-redux'
import store from './store/store'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import SessionList from './pages/SessionList'
import SubjectList from './pages/SubjectList'
import MyEnrollments from './pages/MyEnrollments'
import EnrollmentTracking from './pages/EnrollmentTracking'
import MentorProfiles from './pages/MentorProfiles'
import SupportDashboard from './pages/SupportDashboard'
import './App.css'

function ProtectedRoute({ children }) {
  const token = useSelector((state) => state.auth.token)
  return token ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const token = useSelector((state) => state.auth.token)
  const user = useSelector((state) => state.auth.user)

  return (
    <div className="glass-card app-shell">
      {token && <Navbar user={user} />}
      <main className="page-shell">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/sessions" element={<ProtectedRoute><SessionList /></ProtectedRoute>} />
          <Route path="/subjects" element={<ProtectedRoute><SubjectList /></ProtectedRoute>} />
          <Route path="/enrollments" element={<ProtectedRoute><MyEnrollments /></ProtectedRoute>} />
          <Route path="/mentors" element={<ProtectedRoute><MentorProfiles /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><SupportDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={token ? '/' : '/login'} replace />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  )
}

export default App
