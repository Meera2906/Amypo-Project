import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/authSlice'
import UserProfileModal, { getDefaultAvatar } from './UserProfileModal'

function Navbar() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [imgError, setImgError] = useState(false)

  const links = {
    LEARNER: [
      { to: '/', label: 'Home' },
      { to: '/sessions', label: 'Sessions' },
      { to: '/subjects', label: 'Subjects' },
      { to: '/enrollments', label: 'My Enrollments' },
    ],
    MENTOR: [
      { to: '/', label: 'Home' },
      { to: '/sessions', label: 'My Sessions' },
      { to: '/subjects', label: 'Subjects' },
    ],
    ACADEMIC_ADMIN: [
      { to: '/', label: 'Dashboard' },
      { to: '/subjects', label: 'Subjects' },
      { to: '/mentors', label: 'Manage Mentors' },
    ],
    SUPPORT_AGENT: [
      { to: '/', label: 'Home' },
      { to: '/sessions', label: 'Sessions' },
      { to: '/subjects', label: 'Subjects' },
      { to: '/support', label: 'Support Dashboard' },
    ],
  }

  const customerLinks = links[user?.role] || []
  const roleLabel =
    user?.role === 'ACADEMIC_ADMIN'
      ? 'Admin'
      : user?.role === 'SUPPORT_AGENT'
      ? 'Support'
      : user?.role === 'MENTOR'
      ? 'Mentor'
      : 'Learner'

  const avatarUrl = getDefaultAvatar(user)

  return (
    <>
      <nav className="topbar" role="navigation">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {user && (
            <div
              className="avatar-circle leftmost-profile"
              onClick={() => setShowProfileModal(true)}
              title={`View Profile: ${user.fullName || 'User'} (${roleLabel})`}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-royal-blue), var(--color-vivid-blue))',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 0 14px rgba(66, 96, 229, 0.55)',
                cursor: 'pointer',
                flexShrink: 0,
                overflow: 'hidden',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.08)'
                e.currentTarget.style.boxShadow = '0 0 18px rgba(83, 115, 255, 0.8)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 0 14px rgba(66, 96, 229, 0.55)'
              }}
            >
              {!imgError && avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.fullName || 'User'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={() => setImgError(true)}
                />
              ) : (
                user.fullName?.charAt(0) || 'U'
              )}
            </div>
          )}
          <div className="brand">
            <span>LoomLearn</span>
          </div>
        </div>

        <div className="nav-list">
          {customerLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}

          <button type="button" className="logout-button" onClick={() => dispatch(logout())}>
            Logout
          </button>
        </div>
      </nav>

      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  )
}

export default Navbar

