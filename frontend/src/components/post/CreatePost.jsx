import React, { useState, useRef, useEffect } from 'react'
import Avatar from '../ui/Avatar'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import api from '../../services/api'
import '../../styles/posts.css'

const EMOJIS = [
  '😀','😂','😍','🥰','😎','🤔','😢','😡',
  '👍','👎','❤️','🔥','🎉','✨','💯','🙏',
  '😅','🤣','😊','😇','🥳','😴','🤯','😱',
  '👏','💪','🙌','🤝','💔','💕','⭐','🌟',
]

const MORE_OPTIONS = [
  { icon: '📍', label: 'Add Location' },
  { icon: '🏷️', label: 'Tag People' },
  { icon: '📊', label: 'Create Poll' },
  { icon: '🎥', label: 'Add Video' },
]

const MAX_CHARS = 1000

const CreatePost = ({ onPostCreated }) => {
  const { user }      = useAuth()
  const { showToast } = useToast()

  const [text, setText]            = useState('')
  const [imageFile, setImageFile]  = useState(null)
  const [imagePreview, setPreview] = useState('')
  const [loading, setLoading]      = useState(false)
  const [showEmoji, setShowEmoji]  = useState(false)
  const [showMore, setShowMore]    = useState(false)

  const fileInputRef = useRef()
  const textareaRef  = useRef()
  const emojiRef     = useRef()
  const moreRef      = useRef()

  useEffect(() => {
    const handler = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmoji(false)
      if (moreRef.current  && !moreRef.current.contains(e.target))  setShowMore(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const insertEmoji = (emoji) => {
    const ta    = textareaRef.current
    const start = ta.selectionStart
    const end   = ta.selectionEnd
    const next  = text.slice(0, start) + emoji + text.slice(end)
    setText(next)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(start + emoji.length, start + emoji.length)
    }, 0)
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { showToast('Image must be under 5MB', 'error'); return }
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    setPreview('')
    fileInputRef.current.value = ''
  }

  const handleSubmit = async () => {
    if (!text.trim() && !imageFile) { showToast('Add text or an image', 'error'); return }
    setLoading(true)
    try {
      const fd = new FormData()
      if (text.trim()) fd.append('text', text.trim())
      if (imageFile)   fd.append('image', imageFile)
      const res = await api.post('/posts', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setText('')
      removeImage()
      showToast('Post created! 🎉', 'success')
      onPostCreated?.(res.data.post)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to post', 'error')
    } finally {
      setLoading(false)
    }
  }

  const remaining = MAX_CHARS - text.length

  return (
    <div className="create-post-card">
      <div className="create-post-header">
        <h3>Create Post</h3>
        <div className="create-post-tabs">
          <button className="create-post-tab active">All Posts</button>
          <button className="create-post-tab">Promotions</button>
        </div>
      </div>

      <div className="create-post-body">
        <Avatar username={user?.username} size={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <textarea
            ref={textareaRef}
            className="create-post-textarea"
            placeholder="What's on your mind?"
            value={text}
            onChange={e => setText(e.target.value)}
            maxLength={MAX_CHARS}
            rows={3}
          />
          {text.length > 800 && (
            <p className={`char-counter ${remaining < 50 ? 'danger' : 'warn'}`}>
              {remaining} characters left
            </p>
          )}
        </div>
      </div>

      {/* ── Image preview — fixed aspect ratio so full image shows ── */}
      {imagePreview && (
        <div className="create-post-image-preview">
          <img src={imagePreview} alt="Preview" />
          <button className="remove-image-btn" onClick={removeImage}>✕</button>
        </div>
      )}

      <div className="create-post-toolbar">
        <div className="create-post-actions">
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />

          <button className="toolbar-icon-btn" title="Add photo" onClick={() => fileInputRef.current.click()}>
            📷
          </button>

          <div ref={emojiRef} style={{ position: 'relative' }}>
            <button
              className={`toolbar-icon-btn ${showEmoji ? 'active' : ''}`}
              title="Add emoji"
              onClick={() => { setShowEmoji(v => !v); setShowMore(false) }}
            >😊</button>
            {showEmoji && (
              <div className="emoji-picker-popup">
                {EMOJIS.map(e => (
                  <button key={e} className="emoji-btn" onClick={() => insertEmoji(e)}>{e}</button>
                ))}
              </div>
            )}
          </div>

          <div ref={moreRef} style={{ position: 'relative' }}>
            <button
              className={`toolbar-icon-btn ${showMore ? 'active' : ''}`}
              title="More options"
              onClick={() => { setShowMore(v => !v); setShowEmoji(false) }}
              style={{ fontSize: '18px', fontWeight: 'bold' }}
            >≡</button>
            {showMore && (
              <div className="more-options-popup">
                {MORE_OPTIONS.map(opt => (
                  <button key={opt.label} className="more-option-item"
                    onClick={() => { showToast(`${opt.label} — coming soon!`); setShowMore(false) }}>
                    <span>{opt.icon}</span><span>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          className="post-submit-btn"
          onClick={handleSubmit}
          disabled={loading || (!text.trim() && !imageFile)}
        >
          {loading ? <><span className="btn-spinner" /> Posting...</> : <>➤ Post</>}
        </button>
      </div>
    </div>
  )
}

export default CreatePost