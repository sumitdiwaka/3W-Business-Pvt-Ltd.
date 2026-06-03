import React from 'react'
import '../../styles/modal.css'

const ConfirmModal = ({
  title   = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText  = 'Cancel',
  onConfirm,
  onCancel,
  danger = true,
}) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="confirm-modal-box" onClick={e => e.stopPropagation()}>
        {/* Icon */}
        <div className={`confirm-modal-icon ${danger ? 'danger' : 'info'}`}>
          {danger ? '🗑️' : 'ℹ️'}
        </div>

        <h3 className="confirm-modal-title">{title}</h3>
        <p  className="confirm-modal-msg">{message}</p>

        <div className="confirm-modal-actions">
          <button className="pill-btn grey" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={`pill-btn ${danger ? 'danger-btn' : 'primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal