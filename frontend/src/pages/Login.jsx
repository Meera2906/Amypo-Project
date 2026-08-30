import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate } from 'react-router-dom'
import { login } from '../store/slices/authSlice'

function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token, loading, error } = useSelector((state) => state.auth)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const resultAction = await dispatch(login(form))
    if (login.fulfilled.match(resultAction)) {
      navigate('/')
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <p data-testid="error-message" className="error-box">
              {error === 'Invalid Credentials.' ? 'Invalid Credentials.' : 'Invalid Credentials.'}
            </p>
          )}

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Loading...' : 'Login'}
          </button>

          <button type="button" className="secondary-btn" onClick={() => navigate('/register')}>
            Create an account
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
