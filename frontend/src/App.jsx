import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Provider, useSelector } from 'react-redux'
import store from './store/store'
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
  const token = useSelector((state) => state.auth.token)
  const user = useSelector((state) => state.auth.user)

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
              dotRadius={2.8}
              dotSpacing={40}
              bulgeStrength={120}
              glowRadius={550}
              sparkle={true}
              waveAmplitude={6}
              cursorRadius={180}
              gradientFrom="#7884d7"
              gradientTo="#4260e5"
              glowColor="#4260e5"
            />
          </div>
          <AppRoutes />
        </div>
      </BrowserRouter>
    </Provider>
  )
}

export default App
