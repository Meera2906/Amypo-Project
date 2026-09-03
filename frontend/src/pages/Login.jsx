import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../store/slices/authSlice';
import DotField from '../components/DotField';
import './Login.css';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Interactive mouse tracking for dynamic wave gradient using exact theme colors
  const heroRef = useRef(null);
  const [gradientPos, setGradientPos] = useState({
    x1: 0,
    y1: 0,
    x2: 100,
    y2: 100,
    stop1: '#17205a', // Deep Blue
    stop2: '#1c21ab', // Royal Blue
    stop3: '#4260e5', // Vivid Blue Accent
  });

  useEffect(() => {
    function handleMouseMove(e) {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

      // Interpolate theme colors (#17205a -> #1c21ab -> #4260e5 -> #7884d7) dynamically with mouse movement
      setGradientPos({
        x1: Math.round(xPct * 0.4),
        y1: Math.round(yPct * 0.4),
        x2: Math.round(100 - xPct * 0.3),
        y2: Math.round(100 - yPct * 0.3),
        stop1: xPct > 50 ? '#1c21ab' : '#17205a',
        stop2: yPct > 50 ? '#4260e5' : '#3d4aa0',
        stop3: (xPct + yPct) > 100 ? '#7884d7' : '#4260e5',
      });
    }

    const heroEl = heroRef.current;
    if (heroEl) {
      heroEl.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      if (heroEl) heroEl.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const resultAction = await dispatch(login(form));
    if (login.fulfilled.match(resultAction)) {
      navigate('/');
    }
  };

  return (
    <div className="login-split-page">
      {/* Background Interactive Canvas */}
      <div className="login-dotfield-bg">
        <DotField
          dotRadius={1.5}
          dotSpacing={22}
          cursorRadius={160}
          bulgeStrength={70}
          waveAmplitude={0}
          baseColor="rgba(255, 255, 255, 0.12)"
          activeGradientFrom="#7884d7"
          activeGradientTo="#4260e5"
        />
      </div>

      {/* Top Header Sign Up Action */}
      <header className="login-top-bar">
        <button type="button" className="top-signin-btn" onClick={() => navigate('/register')}>
          Sign Up
        </button>
      </header>

      <div className="login-container">
        {/* Left Hero Section with Interactive Curved Wave */}
        <div className="login-hero-side" ref={heroRef}>
          <div className="login-wavy-bg">
            <svg viewBox="0 0 500 800" preserveAspectRatio="none">
              <defs>
                <linearGradient
                  id="waveGradient"
                  x1={`${gradientPos.x1}%`}
                  y1={`${gradientPos.y1}%`}
                  x2={`${gradientPos.x2}%`}
                  y2={`${gradientPos.y2}%`}
                >
                  <stop offset="0%" stopColor={gradientPos.stop1} />
                  <stop offset="50%" stopColor={gradientPos.stop2} />
                  <stop offset="100%" stopColor={gradientPos.stop3} />
                </linearGradient>
              </defs>
              <path
                d="M 0,0 L 320,0 C 480,200 240,400 440,600 C 520,680 460,800 380,800 L 0,800 Z"
                fill="url(#waveGradient)"
                style={{ transition: 'fill 0.15s ease-out' }}
              />
            </svg>
          </div>
          <div className="hero-content">
            <span className="hero-subtitle">LoomLearn Portal</span>
            <h1 className="hero-title">
              Peer-to-Peer <br /> Learning Hub
            </h1>

            <div className="hero-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Peer Tutoring</h3>
                  <p>Connect with verified student mentors</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Session Scheduling</h3>
                  <p>Real-time booking and capacity management</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Subject Excellence</h3>
                  <p>Academic subject tracking & peer feedback</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="login-form-side">
          <div className="form-card">
            <div className="lock-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>

            <h2 className="form-title">Login to LoomLearn</h2>
            <p className="form-subtitle">Enter your academic credentials to continue</p>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <button type="button" className="forgot-link" onClick={() => alert('Please contact academic admin to reset password.')}>
                  Forgot password ?
                </button>
              </div>

              {error && (
                <p data-testid="error-message" className="error-box">
                  {error}
                </p>
              )}

              <button type="submit" className="continue-btn" disabled={loading}>
                {loading ? 'Loading...' : 'Continue'}
              </button>

              <div className="divider">
                <span>or</span>
              </div>

              <button
                type="button"
                className="google-btn"
                onClick={() => alert('Google authentication coming soon!')}
              >
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="help-footer">
                <span>Need help ? </span>
                <button type="button" className="contact-link" onClick={() => alert('Support contact: support@loomlearn.edu')}>
                  Contact admin
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
