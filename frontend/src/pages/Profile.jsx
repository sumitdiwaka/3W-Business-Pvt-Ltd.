import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import PostCard from '../components/post/PostCard'
import Avatar from '../components/ui/Avatar'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../services/api'
import '../styles/layout.css'
import '../styles/modal.css'
import '../styles/posts.css'

/* ── Edit Profile Modal ── */
const EditProfileModal = ({ user, onClose, onSave }) => {
  const { showToast } = useToast()
  const [form, setForm]     = useState({ username: user.username || '', bio: user.bio || '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const validate = () => {
    const e = {}
    if (!form.username.trim()) e.username = 'Username is required'
    else if (form.username.length < 3) e.username = 'At least 3 characters'
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = 'Letters, numbers, underscores only'
    if (form.bio.length > 150) e.bio = 'Max 150 characters'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const res = await api.put('/users/profile', { username: form.username.trim(), bio: form.bio.trim() })
      onSave(res.data.user)
      showToast('Profile updated! ✅', 'success')
      onClose()
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Profile</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '5px' }}>Username</label>
              <input
                className={`form-input ${errors.username ? 'error' : ''}`}
                value={form.username}
                onChange={e => { setForm(f => ({ ...f, username: e.target.value })); setErrors(er => ({ ...er, username: '' })) }}
                placeholder="your_username"
              />
              {errors.username && <p className="form-error">{errors.username}</p>}
            </div>
            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '5px' }}>Bio <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({150 - form.bio.length} left)</span></label>
              <textarea
                className="create-post-textarea"
                value={form.bio}
                onChange={e => { setForm(f => ({ ...f, bio: e.target.value })); setErrors(er => ({ ...er, bio: '' })) }}
                placeholder="Tell people about yourself..."
                maxLength={150}
                rows={3}
              />
              {errors.bio && <p className="form-error">{errors.bio}</p>}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="pill-btn grey" onClick={onClose}>Cancel</button>
            <button type="submit" className="pill-btn primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Profile Page ── */
const Profile = () => {
  const { user, login, token, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const avatarInputRef = useRef()

  const [posts, setPosts]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [showEdit, setShowEdit]   = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [localUser, setLocalUser] = useState(user)

  useEffect(() => { setLocalUser(user) }, [user])

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    const fetch = async () => {
      try {
        const res = await api.get(`/posts/user/${user.username}`)
        setPosts(res.data.posts)
      } catch { /* silent */ }
      finally { setLoading(false) }
    }
    fetch()
  }, [user, navigate])

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { showToast('Image must be under 5MB', 'error'); return }
    setAvatarLoading(true)
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      const res = await api.put('/users/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setLocalUser(res.data.user)
      login(res.data.user, token) // Update context
      showToast('Avatar updated! 🎉', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Upload failed', 'error')
    } finally {
      setAvatarLoading(false)
      avatarInputRef.current.value = ''
    }
  }

  const handleProfileSaved = (updatedUser) => {
    setLocalUser(updatedUser)
    login(updatedUser, token)
    // Refresh posts with new username
    const fetchPosts = async () => {
      const res = await api.get(`/posts/user/${updatedUser.username}`)
      setPosts(res.data.posts)
    }
    fetchPosts()
  }

  const totalLikes    = posts.reduce((s, p) => s + (p.likes?.length || 0), 0)
  const totalComments = posts.reduce((s, p) => s + (p.comments?.length || 0), 0)

  if (!localUser) return null

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="profile-page">

          {/* ── Profile Header Card ── */}
          <div className="profile-header-card">
            <div className="profile-cover" />
            <div className="profile-info-section">
              <div className="profile-avatar-row">
                <div className="profile-avatar-wrap">
                  <Avatar username={localUser.username} src={localUser.avatar} size={72} />
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                  />
                  <button
                    className="avatar-upload-btn"
                    title="Change photo"
                    onClick={() => avatarInputRef.current.click()}
                    disabled={avatarLoading}
                  >
                    {avatarLoading ? '⏳' : '📷'}
                  </button>
                </div>
                <div className="profile-actions">
                  <button className="pill-btn primary" onClick={() => setShowEdit(true)}>
                    ✏️ Edit Profile
                  </button>
                  <button className="pill-btn grey" onClick={() => { logout(); navigate('/login') }}>
                    🚪 Logout
                  </button>
                </div>
              </div>

              <h2 className="profile-name">{localUser.username}</h2>
              <p className="profile-handle">@{localUser.username} · {localUser.email}</p>
              {localUser.bio && <p className="profile-bio">{localUser.bio}</p>}

              <div className="profile-stats">
                <div className="profile-stat">
                  <p className="stat-num">{posts.length}</p>
                  <p className="stat-label">Posts</p>
                </div>
                <div className="profile-stat">
                  <p className="stat-num">{totalLikes}</p>
                  <p className="stat-label">Likes</p>
                </div>
                <div className="profile-stat">
                  <p className="stat-num">{totalComments}</p>
                  <p className="stat-label">Comments</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── My Posts ── */}
          <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            📝 My Posts
          </h3>

          {loading ? (
            <div className="page-center"><div className="spinner" /></div>
          ) : posts.length === 0 ? (
            <div className="empty-feed">
              <div className="empty-icon">✍️</div>
              <h3>No posts yet</h3>
              <p>Go to the feed and share your first post!</p>
              <button className="pill-btn primary" style={{ marginTop: '14px' }} onClick={() => navigate('/social')}>
                Go to Feed
              </button>
            </div>
          ) : (
            posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={id => setPosts(prev => prev.filter(p => p._id !== id))}
              />
            ))
          )}
        </div>
      </main>

      {showEdit && (
        <EditProfileModal
          user={localUser}
          onClose={() => setShowEdit(false)}
          onSave={handleProfileSaved}
        />
      )}
    </div>
  )
}

export default Profile