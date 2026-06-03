import React, { useState, useEffect, useCallback } from 'react'
import Sidebar from '../components/layout/Sidebar'
import RightPanel from '../components/layout/RightPanel'
import CreatePost from '../components/post/CreatePost'
import PostCard from '../components/post/PostCard'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import '../styles/layout.css'
import '../styles/posts.css'

const FILTERS = ['All Post', 'For You', 'Most Liked', 'Most Commented']

const Feed = () => {
  const { user } = useAuth()

  const [posts, setPosts]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState('All Post')
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(1)
  const [hasMore, setHasMore]       = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [myPostCount, setMyPostCount] = useState(0)

  const fetchPosts = useCallback(async (pageNum = 1, replace = true) => {
    replace ? setLoading(true) : setLoadingMore(true)
    try {
      const res = await api.get(`/posts?page=${pageNum}&limit=10`)
      setPosts(prev => replace ? res.data.posts : [...prev, ...res.data.posts])
      setHasMore(res.data.pagination.hasNextPage)
      setPage(pageNum)
    } catch (err) {
      console.error('Failed to fetch posts', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => { fetchPosts(1, true) }, [fetchPosts])

  useEffect(() => {
    if (user) setMyPostCount(posts.filter(p => p.username === user.username).length)
  }, [posts, user])

  const handlePostCreated = (newPost) => setPosts(prev => [newPost, ...prev])
  const handlePostDeleted = (postId)  => setPosts(prev => prev.filter(p => p._id !== postId))

  const getFilteredPosts = () => {
    let list = [...posts]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p => p.text?.toLowerCase().includes(q) || p.username?.toLowerCase().includes(q))
    }
    if (filter === 'For You' && user)    list = list.filter(p => p.username === user.username)
    if (filter === 'Most Liked')         list = [...list].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
    if (filter === 'Most Commented')     list = [...list].sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0))
    return list
  }

  const filtered = getFilteredPosts()

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <div className="feed-layout">
          <div className="feed-center">

            {/* Topbar — extra left padding on tablet for hamburger */}
            <div className="feed-topbar" style={{ paddingLeft: 'clamp(0px, 4vw, 48px)' }}>
              <h1>Social</h1>
              <div className="search-bar">
                <span>🔍</span>
                <input
                  type="text"
                  placeholder="Search posts, users..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '14px' }}
                  >✕</button>
                )}
              </div>
            </div>

            {user && <CreatePost onPostCreated={handlePostCreated} />}

            <div className="filter-tabs">
              {FILTERS.map(f => (
                <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                  {f}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="page-center"><div className="spinner" /><p>Loading posts...</p></div>
            ) : filtered.length === 0 ? (
              <div className="empty-feed">
                <div className="empty-icon">📭</div>
                <h3>{search ? 'No results found' : 'No posts yet'}</h3>
                <p>{search ? `No posts match "${search}"` : 'Be the first to share something!'}</p>
              </div>
            ) : (
              <>
                {filtered.map(post => (
                  <PostCard key={post._id} post={post} onDelete={handlePostDeleted} />
                ))}
                {hasMore && !search && filter === 'All Post' && (
                  <button className="load-more-btn" onClick={() => fetchPosts(page + 1, false)} disabled={loadingMore}>
                    {loadingMore ? 'Loading...' : 'Load more posts'}
                  </button>
                )}
              </>
            )}
          </div>

          <RightPanel postCount={myPostCount} />
        </div>
      </main>
    </div>
  )
}

export default Feed