import React, { useEffect, useCallback } from 'react';
import DeleteIcon from './DeleteIcon.png';
import './EmailTab.css';

const DeleteEmailGroup = ({ onCancel, onDelete, groupName }) => {
  const handleKey = useCallback((e) => { if (e.key === 'Escape') onCancel?.(); }, [onCancel]);
  useEffect(() => { document.addEventListener('keydown', handleKey); return () => document.removeEventListener('keydown', handleKey); }, [handleKey]);
  const stopPropagation = (e) => e.stopPropagation();
  return (
    <div className="modal-overlay" role="presentation" onClick={onCancel}>
      <div className="modal-content email-modal threshold-themed delete-email-modal" role="dialog" aria-modal="true" aria-labelledby="delete-email-group-title" onClick={stopPropagation}>
        <div className="modal-header" style={{ padding:'20px 24px 0 24px' }}>
          <h2 className="modal-title" id="delete-email-group-title" style={{ fontSize:18, fontWeight:600 }}>Delete Email Group</h2>
          <button type="button" className="modal-close" aria-label="Close" onClick={onCancel}>×</button>
        </div>
        <div className="modal-form" style={{ textAlign:'center', padding:'8px 24px 32px' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:8 }}>
            <img src={DeleteIcon} alt="Delete" style={{ width:220, height:220, objectFit:'contain' }} />
          </div>
          <h5 style={{ margin:'8px 0 24px', fontSize:16, fontWeight:500, color:'#17181E' }}>
            Do you want to delete {groupName ? `"${groupName}"` : ''} Email Group?
          </h5>
          <div className="modal-actions" style={{ justifyContent:'center', gap:20 }}>
            <button type="button" className="cancel-btn" onClick={onCancel} autoFocus style={{ minWidth:110 }}>Cancel</button>
            <button type="button" className="danger-btn" onClick={onDelete} style={{ minWidth:110 }}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteEmailGroup;
