import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import '../../styles/layout.css';

const RightPanel = ({ postCount = 0 }) => {
  const { user } = useAuth();

  return (
    <aside className="feed-right">
      {/* User info card */}
      {user && (
        <div className="widget-card widget-user-info">
          <Avatar username={user.username} size={64} />
          <p className="user-name">@{user.username}</p>
          <p className="user-email">{user.email}</p>
          <div className="widget-user-stats">
            <div className="widget-user-stat">
              <p className="stat-num">{postCount}</p>
              <p className="stat-label">Posts</p>
            </div>
            <div className="widget-user-stat">
              <p className="stat-num">0</p>
              <p className="stat-label">Following</p>
            </div>
          </div>
        </div>
      )}

      {/* Tips card */}
      <div className="widget-card">
        <p className="widget-title">💡 Tips</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { icon: '📸', text: 'Share images to get more engagement' },
            { icon: '💬', text: 'Comment on posts to connect with others' },
            { icon: '❤️', text: 'Like posts from people you enjoy' },
          ].map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{tip.icon}</span>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{tip.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '4px' }}>
        SocialApp © 2024 · Built with ❤️
      </p>
    </aside>
  );
};

export default RightPanel;