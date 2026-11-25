import React from 'react';
import './MainLayout.css';
// Re‑use global button styling & common button component used in Zones page
import '../../../Components/Styles/CustomButtons.css';
import Buttons from '../../CommonComponents/Button';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const MainLayout = ({ children, onAdd, onEdit, onDelete, disableEdit, disableDelete }) => {
  const showHeader = onAdd || onEdit || onDelete; // allow reuse without header actions
  return (
    <div className="threshold-page main-layout">
      {showHeader && (
        <div className="main-header">
          <div className="actions p-4">
            {onEdit && (
              <Buttons
                text="Edit Threshold"
                type="button"
                size="md"
                variant="light"
                className="btn-soft-outline"
                icon={<FaEdit />}
                iconPosition="right"
                onClick={onEdit}
                disabled={disableEdit}
              />
            )}{' '}
            {onDelete && (
              <Buttons
                text="Delete Threshold"
                type="button"
                size="md"
                variant="light"
                className="btn-soft-outline"
                icon={<FaTrash />}
                iconPosition="right"
                onClick={onDelete}
                disabled={disableDelete}
              />
            )}{' '}
            {onAdd && (
              <Buttons
                text="Add Threshold"
                type="button"
                size="md"
                variant="light"
                className="btn-soft-outline"
                icon={<FaPlus />}
                iconPosition="right"
                onClick={onAdd}
              />
            )}
          </div>
        </div>
      )}
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
