import React from 'react';

// Shows image avatar or colored initial placeholder
const Avatar = ({ username = '', src = '', size = 40 }) => {
  const initials = username ? username.charAt(0).toUpperCase() : '?';

  // Generate a consistent color from username
  const colors = [
    'linear-gradient(135deg, #1E90FF, #7b2ff7)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #fa709a, #fee140)',
    'linear-gradient(135deg, #a18cd1, #fbc2eb)',
    'linear-gradient(135deg, #ffecd2, #fcb69f)',
    'linear-gradient(135deg, #ff9a9e, #fecfef)',
  ];
  const colorIndex = username
    ? username.charCodeAt(0) % colors.length
    : 0;

  if (src) {
    return (
      <img
        className="avatar"
        src={src}
        alt={username}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="avatar-placeholder"
      style={{
        width: size,
        height: size,
        background: colors[colorIndex],
        fontSize: size * 0.38,
      }}
    >
      {initials}
    </div>
  );
};

export default Avatar;