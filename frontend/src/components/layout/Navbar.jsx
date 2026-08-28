import { NavLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/slices/authSlice'

function Navbar() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)

  const links = {
    LEARNER: [
      { to: '/sessions', label: 'Sessions' },
      { to: '/subjects', label: 'Subjects' },
      { to: '/enrollments', label: 'Enrollments' },
    ],
    MENTOR: [
      { to: '/sessions', label: 'Sessions' },
      { to: '/subjects', label: 'Subjects' },
    ],
    ACADEMIC_ADMIN: [
      { to: '/subjects', label: 'Subjects' },
      { to: '/mentors', label: 'Mentors' },
    ],
    SUPPORT_AGENT: [{ to: '/support', label: 'Support' }],
  }

  const customerLinks = links[user?.role] || []

  return (
    <nav className="topbar" role="navigation">
      <div className="brand">LoomLearn</div>
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
  )
}

export default Navbar
