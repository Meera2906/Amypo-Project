import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate } from 'react-router-dom'
import { register } from '../store/slices/authSlice'

function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token, loading, error } = useSelector((state) => state.auth)
  const [role, setRole] = useState('LEARNER')
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    department: '',
    bio: '',
  })

  if (token) return <Navigate to="/" replace />

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const payload = {
      ...form,
      role,
    }
    const resultAction = await dispatch(register(payload))
    if (register.fulfilled.match(resultAction)) {
      navigate('/')
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Create account</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="role-switch">
            <button
              type="button"
              className={`role-option ${role === 'LEARNER' ? 'active' : ''}`}
              onClick={() => setRole('LEARNER')}
            >
              Learner
            </button>
            <button
              type="button"
              className={`role-option ${role === 'MENTOR' ? 'active' : ''}`}
              onClick={() => setRole('MENTOR')}
            >
              Mentor
            </button>
          </div>

          <div className="field">
            <label htmlFor="fullName">Full Name</label>
            <input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} required />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
          </div>

          {role === 'MENTOR' && (
            <>
              <div className="field">
                <label htmlFor="department">Department</label>
                <input id="department" name="department" value={form.department} onChange={handleChange} />
              </div>
              <div className="field">
                <label htmlFor="bio">Bio</label>
                <textarea id="bio" name="bio" value={form.bio} onChange={handleChange} />
              </div>
            </>
          )}

          {error && <p className="error-box">{error}</p>}

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Register'}
          </button>
          <button type="button" className="secondary-btn" onClick={() => navigate('/login')}>
            Back to login
          </button>
        </form>
      </div>
    </div>
  )
}

export default Register
