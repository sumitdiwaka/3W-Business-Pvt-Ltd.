import React, { useState } from 'react'
import Avatar from '../ui/Avatar'
import ConfirmModal from '../ui/ConfirmModal'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import api from '../../services/api'
import '../../styles/posts.css'
import '../../styles/modal.css'

const formatDate = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)     return 'just now'
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

const PostCard = ({ post, onDelete }) => {
  const { user }      = useAuth()
  const { showToast } = useToast()

  const [likes, setLikes]       = useState(post.likes || [])
  const [likedBy, setLikedBy]   = useState(post.likedBy || [])
  const [comments, setComments] = useState(post.comments || [])
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText]   = useState('')
  const [expanded, setExpanded]         = useState(false)
  const [lightbox, setLightbox]         = useState(false)
  const [likeLoading, setLikeLoading]   = useState(false)
  const [commentLoading, setCommentLoading] = useState(false)
  const [following, setFollowing]       = useState(false)
  // Confirm delete modal state
  const [confirmDelete, setConfirmDelete]         = useState(false)
  const [confirmDeleteComment, setConfirmDeleteComment] = useState(null) // holds commentId

  const isLiked = user ? likes.some(id => String(id) === String(user._id)) : false
  const isOwner = user && String(user._id) === String(post.user)
  const longText = post.text && post.text.length > 280

  /* ── Like (optimistic) ── */
  const handleLike = async () => {
    if (!user) { showToast('Please log in to like posts', 'error'); return }
    if (likeLoading) return
    setLikeLoading(true)
    const wasLiked = isLiked
    // Optimistic
    if (wasLiked) {
      setLikes(p => p.filter(id => String(id) !== String(user._id)))
      setLikedBy(p => p.filter(n => n !== user.username))
    } else {
      setLikes(p => [...p, user._id])
      setLikedBy(p => [...p, user.username])
    }
    try {
      const res = await api.put(`/posts/${post._id}/like`)
      setLikedBy(res.data.likedBy)
    } catch {
      // revert
      if (wasLiked) { setLikes(p => [...p, user._id]); setLikedBy(p => [...p, user.username]) }
      else          { setLikes(p => p.filter(id => String(id) !== String(user._id))); setLikedBy(p => p.filter(n => n !== user.username)) }
      showToast('Failed to update like', 'error')
    } finally { setLikeLoading(false) }
  }

  /* ── Comment ── */
  const handleComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || !user) return
    setCommentLoading(true)
    try {
      const res = await api.post(`/posts/${post._id}/comments`, { text: commentText.trim() })
      setComments(p => [...p, res.data.comment])
      setCommentText('')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to comment', 'error')
    } finally { setCommentLoading(false) }
  }

  /* ── Delete Comment (after confirm) ── */
  const handleDeleteComment = async () => {
    const commentId = confirmDeleteComment
    setConfirmDeleteComment(null)
    try {
      await api.delete(`/posts/${post._id}/comments/${commentId}`)
      setComments(p => p.filter(c => c._id !== commentId))
      showToast('Comment deleted')
    } catch { showToast('Failed to delete comment', 'error') }
  }

  /* ── Delete Post (after confirm) ── */
  const handleDeletePost = async () => {
    setConfirmDelete(false)
    try {
      await api.delete(`/posts/${post._id}`)
      onDelete?.(post._id)
      showToast('Post deleted')
    } catch { showToast('Failed to delete post', 'error') }
  }

  /* ── Share ── */
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: `Post by ${post.username}`, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        showToast('Link copied!', 'success')
      }
    } catch { showToast('Link copied!', 'success') }
  }

  return (
    <>
      <div className="post-card">
        <div className="post-card-body">
          {/* ── Header ── */}
          <div className="post-header">
            {/* post.userAvatar is populated live from User collection by backend */}
            <Avatar
              username={post.username}
              src={post.userAvatar || ''}
              size={42}
            />
            <div className="post-header-info">
              <div className="post-author-row">
                <span className="post-author-name">{post.username}</span>
                <span className="post-author-handle">@{post.username}</span>
              </div>
              <p className="post-date">{formatDate(post.createdAt)}</p>
            </div>

            {user && !isOwner && (
              <button
                className={`follow-btn ${following ? 'following' : 'follow'}`}
                onClick={() => setFollowing(v => !v)}
              >
                {following ? 'Following' : 'Follow'}
              </button>
            )}

            {isOwner && (
              <button className="post-delete-btn" onClick={() => setConfirmDelete(true)} title="Delete post">
                🗑️
              </button>
            )}
          </div>

          {/* ── Text ── */}
          {post.text && (
            <>
              <p className={`post-text ${longText && !expanded ? 'collapsed' : ''}`}>
                {post.text}
              </p>
              {longText && (
                <button className="read-more-btn" onClick={() => setExpanded(v => !v)}>
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </>
          )}
        </div>

        {/* ── Image — full width, natural height ── */}
        {post.image?.url && (
          <div className="post-image-wrapper" onClick={() => setLightbox(true)}>
            <img src={post.image.url} alt="Post" />
          </div>
        )}

        {/* Liked by */}
        {likedBy.length > 0 && (
          <div className="liked-by-list">
            ❤️ {likedBy.slice(0, 3).join(', ')}
            {likedBy.length > 3 ? ` and ${likedBy.length - 3} others` : ''}
          </div>
        )}

        {/* ── Actions ── */}
        <div className="post-actions">
          <button className={`action-btn ${isLiked ? 'liked' : ''}`} onClick={handleLike} disabled={likeLoading}>
            <span className="action-icon">{isLiked ? '❤️' : '🤍'}</span>
            {likes.length > 0 && <span className="action-count">{likes.length}</span>}
          </button>

          <button className={`action-btn ${showComments ? 'commented' : ''}`} onClick={() => setShowComments(v => !v)}>
            <span className="action-icon">💬</span>
            {comments.length > 0 && <span className="action-count">{comments.length}</span>}
          </button>

          <button className="action-btn share-btn" onClick={handleShare}>
            <span className="action-icon">↗️</span>
          </button>
        </div>

        {/* ── Comments ── */}
        {showComments && (
          <div className="comments-section">
            {user && (
              <div className="add-comment-row">
                <Avatar username={user.username} src={user.avatar} size={28} />
                <form className="comment-form" onSubmit={handleComment}>
                  <input
                    className="comment-input"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    maxLength={500}
                  />
                  <button className="comment-submit-btn" type="submit" disabled={!commentText.trim() || commentLoading}>
                    ➤
                  </button>
                </form>
              </div>
            )}

            {comments.length > 0 ? (
              <div className="comments-list">
                {comments.map(c => (
                  <div key={c._id} className="comment-item">
                    <Avatar username={c.username} src={c.userAvatar} size={26} />
                    <div className="comment-bubble">
                      <p className="comment-author">{c.username}</p>
                      <p className="comment-text">{c.text}</p>
                      <p className="comment-time">{formatDate(c.createdAt)}</p>
                    </div>
                    {user && (String(user._id) === String(c.user) || String(user._id) === String(post.user)) && (
                      <button className="comment-delete-btn" onClick={() => setConfirmDeleteComment(c._id)}>✕</button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-comments">No comments yet. Be the first!</p>
            )}
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(false)}>
          <button className="lightbox-close">✕</button>
          <img src={post.image.url} alt="Full" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* ── Delete Post Confirm Modal ── */}
      {confirmDelete && (
        <ConfirmModal
          title="Delete Post?"
          message="This post will be permanently deleted. This action cannot be undone."
          confirmText="Yes, Delete"
          cancelText="Cancel"
          onConfirm={handleDeletePost}
          onCancel={() => setConfirmDelete(false)}
          danger
        />
      )}

      {/* ── Delete Comment Confirm Modal ── */}
      {confirmDeleteComment && (
        <ConfirmModal
          title="Delete Comment?"
          message="This comment will be removed permanently."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteComment}
          onCancel={() => setConfirmDeleteComment(null)}
          danger
        />
      )}
    </>
  )
}

export default PostCard