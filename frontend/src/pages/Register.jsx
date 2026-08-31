import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register } from '../store/slices/authSlice';
import DotField from '../components/DotField';
import './Login.css';

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [role, setRole] = useState('LEARNER');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    department: '',
    bio: '',
  });
  const [showPassword, setShowPassword] = useState(false);

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
    const payload = {
      ...form,
      role,
    };
    const resultAction = await dispatch(register(payload));
    if (register.fulfilled.match(resultAction)) {
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

      {/* Top Header Sign In Link Action */}
      <header className="login-top-bar">
        <button type="button" className="top-signin-btn" onClick={() => navigate('/login')}>
          Sign In
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
            <span className="hero-subtitle">Join LoomLearn</span>
            <h1 className="hero-title">
              Start Learning <br /> & Mentoring
            </h1>

            <div className="hero-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <polyline points="17 11 19 13 23 9"></polyline>
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Flexible Academic Roles</h3>
                  <p>Register as a Learner or Student Mentor</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Subject Coverage</h3>
                  <p>Access structured course modules & resources</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Peer Recognition</h3>
                  <p>Earn feedback ratings and mentor badges</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="login-form-side">
          <div className="form-card" style={{ maxWidth: '440px' }}>
            <div className="lock-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="17" y1="11" x2="23" y2="11"></line>
              </svg>
            </div>

            <h2 className="form-title">Create an Account</h2>
            <p className="form-subtitle">Select your role and enter your details</p>

            <form className="login-form" onSubmit={handleSubmit}>
              {/* Role Toggle */}
              <div className="role-switch-wrap">
                <button
                  type="button"
                  className={`role-btn ${role === 'LEARNER' ? 'active' : ''}`}
                  onClick={() => setRole('LEARNER')}
                >
                  Learner
                </button>
                <button
                  type="button"
                  className={`role-btn ${role === 'MENTOR' ? 'active' : ''}`}
                  onClick={() => setRole('MENTOR')}
                >
                  Mentor
                </button>
              </div>

              <div className="input-group">
                <label htmlFor="fullName">Full Name</label>
                <div className="input-wrapper">
                  <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

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
                    placeholder="Enter your academic email"
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
                    placeholder="Create a strong password"
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

              {role === 'MENTOR' && (
                <>
                  <div className="input-group">
                    <label htmlFor="department">Department</label>
                    <div className="input-wrapper">
                      <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                      </svg>
                      <input
                        id="department"
                        name="department"
                        type="text"
                        placeholder="e.g. Computer Science & Engineering"
                        value={form.department}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label htmlFor="bio">Bio & Specializations</label>
                    <div className="input-wrapper">
                      <textarea
                        id="bio"
                        name="bio"
                        placeholder="Share your tutoring subjects and academic interests..."
                        value={form.bio}
                        onChange={handleChange}
                        rows="3"
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          fontSize: '0.95rem',
                          color: '#0f172a',
                          outline: 'none',
                          resize: 'none',
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              {error && (
                <p data-testid="error-message" className="error-box">
                  {error}
                </p>
              )}

              <button type="submit" className="continue-btn" disabled={loading}>
                {loading ? 'Submitting...' : 'Complete Registration'}
              </button>

              <div className="help-footer" style={{ marginTop: '8px' }}>
                <span>Already have an account? </span>
                <button type="button" className="contact-link" onClick={() => navigate('/login')}>
                  Sign in here
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
