import React, { useEffect, useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { Modal, Button, Image } from 'react-bootstrap';
import DeleteIcon from './DeleteIcon.png';
import '../Threshold/components/DeleteThresholdModal.css';
import './EmailTab.css';

// Styled to match DeleteThresholdModal / DeleteZoneModal
const DeleteEmailGroup = ({ open = true, onCancel, onDelete, groupName }) => {
  const [deleting, setDeleting] = useState(false);
  const handleKey = useCallback((e) => { if (e.key === 'Escape') onCancel?.(); }, [onCancel]);
  useEffect(() => { document.addEventListener('keydown', handleKey); return () => document.removeEventListener('keydown', handleKey); }, [handleKey]);
  const stopPropagation = (e) => e.stopPropagation();
  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      let result = await (onDelete?.() || Promise.resolve());
      let apiMessage = '';
      let apiSuccess = undefined;
      if (result && typeof Response !== 'undefined' && result instanceof Response) {
        try {
          const text = await result.text();
          if (text) {
            try {
              const json = JSON.parse(text);
              apiMessage = json?.message || json?.Message || '';
              apiSuccess = json?.success;
            } catch { apiMessage = text; }
          }
        } catch {}
      } else if (result && typeof result === 'object') {
        apiMessage = result.message || result.Message || '';
        apiSuccess = typeof result.success === 'boolean' ? result.success : undefined;
      } else if (typeof result === 'string') {
        apiMessage = result;
      }
      apiMessage = (apiMessage || '').toString().trim();
      if (apiSuccess === false) {
        {
          const emsg = apiMessage || 'Failed to delete email group';
          console.error('Toast error:', emsg);
          toast.error(emsg, { containerId: 'email-group', position: 'top-right', autoClose: 3000 });
        }
      } else {
        {
          const smsg = apiMessage || 'Email group deleted successfully';
          console.log('Toast success:', smsg);
          toast.success(smsg, { containerId: 'email-group', position: 'top-right', autoClose: 3000 });
        }
      }
      onCancel?.();
    } catch (err) {
      {
        const emsg = err?.message || 'Failed to delete email group';
        console.error('Toast error:', emsg);
        toast.error(emsg, { containerId: 'email-group', position: 'top-right', autoClose: 3000 });
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal show={open} onHide={onCancel} centered backdrop="static" size="md" className="delete-threshold-mdl">
      <Modal.Header closeButton>
        <Modal.Title>Delete Email Group</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center delete-threshold-body">
        <Image src={DeleteIcon} alt="Delete" className="delete-threshold-image mb-3" />
        <h5 className="mt-2">
          Do you want to delete{groupName ? ` "${groupName}"` : ''} Email Group?
        </h5>
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <Button className="btn btn-primary btn-sm" variant="light" onClick={onCancel} disabled={deleting}>
          Cancel
        </Button>
        <Button
          className="btn btn-primary btn-sm delete"
          variant="danger"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteEmailGroup;
