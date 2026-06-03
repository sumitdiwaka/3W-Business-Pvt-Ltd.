import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../ui/Avatar'
import '../../styles/layout.css'

const navItems = [
  { icon: '🏠', label: 'Home',       path: '/'        },
  { icon: '🌐', label: 'Social',     path: '/social'  },
  { icon: '👤', label: 'My Profile', path: '/profile' },
]

const Sidebar = () => {
  const { user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [open, setOpen] = useState(false)

  // Close sidebar on route change
  useEffect(() => { setOpen(false) }, [location.pathname])

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* ── Hamburger button (tablet/mobile only) ── */}
      <button
        className="hamburger-btn"
        onClick={() => setOpen(v => !v)}
        style={{ position: 'fixed', top: 14, left: 14, zIndex: 300 }}
        title="Menu"
      >
        {open ? '✕' : '☰'}
      </button>

      {/* ── Backdrop ── */}
      <div
        className={`sidebar-backdrop ${open ? 'show' : ''}`}
        onClick={() => setOpen(false)}
      />

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🌐</div>
          <h2>SocialApp</h2>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* ── User card at bottom ── */}
        {user && (
          <div className="sidebar-user" onClick={() => navigate('/profile')}>
            <Avatar username={user.username} src={user.avatar} size={34} />
            <div className="sidebar-user-info">
              <p className="username">@{user.username}</p>
              <p className="email">{user.email}</p>
            </div>
            <button
              className="sidebar-logout-btn"
              title="Logout"
              onClick={(e) => { e.stopPropagation(); handleLogout() }}
            >
              🚪
            </button>
          </div>
        )}
      </aside>
    </>
  )
}

export default Sidebar