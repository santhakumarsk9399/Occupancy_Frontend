import React, { useEffect, useState, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MainLayout from '../components/MainLayout';
import Buttons from '../../CommonComponents/Button';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import SearchBar from '../components/SearchBar';
import ThresholdsTable from '../components/ThresholdsTable';
import ThresholdForm from '../components/ThresholdForm';
import DeleteThresholdModal from '../components/DeleteThresholdModal';
import Loader from '../../CommonComponents/Loader';
import '../components/ThresholdsPageToolbar.css';
// import Loader from '../components/Loader';

// Prefer environment variable for API base, fallback to known dev host
const API_BASE = import.meta.env.VITE_API_URL || 'http://delbi2dev.deloptanalytics.com:3000';

// Load thresholds exclusively from API on mount; start with an empty list.

export default function ThresholdsPage() {
  const [thresholds, setThresholds] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  // Reusable loader (also used after closing any popup)
  const loadThresholds = useCallback(async () => {
    let cancelled = false; // local guard if component unmounts mid-request
    setLoading(true);
    setIsLoading(true);
    setError('');
    try {
      const token = sessionStorage.getItem('token');
      if (!token) throw new Error('Missing auth token in session');
      const res = await fetch(`${API_BASE}/settings/threshold/gridView`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: 'Occupancy' }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with ${res.status}`);
      }
      const data = await res.json();
      const nested = Array.isArray(data?.thresHold) ? data.thresHold : [];
      const flat = nested.flat().filter(Boolean);
      const mapped = flat.map((item, idx) => ({
        sl: item?.SL ?? String(idx + 1),
        name: item?.["THRESHOLD(S)NAME"] ?? '',
        start: Number(item?.THRESHOLDSTART ?? 0),
        end: Number(item?.THRESHOLDEND ?? 0),
        duration: Number(item?.["DURATION(SEC)"] ?? 0),
      }));
      if (!cancelled) setThresholds(mapped);
    } catch (err) {
      console.error('Failed to load thresholds grid:', err);
      if (!cancelled) setError(err?.message || 'Failed to load data');
    } finally {
      if (!cancelled) setLoading(false);
      if (!cancelled) setIsLoading(false);
    }
    return () => { cancelled = true; };
  }, []);

  // Initial load
  useEffect(() => { loadThresholds(); }, [loadThresholds]);

  // No localStorage persistence; rely solely on API

  const filtered = thresholds.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleEdit = () => {
    if (!selectedRow) return;
    setEditData(selectedRow);
    setShowForm(true);
  };

  const handleDelete = () => setShowDelete(true);

  const handleSave = (data) => {
    // Close form then refresh from server to ensure canonical data
    setShowForm(false);
    setEditData(null);
    setSelectedRow(null);
    loadThresholds();
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditData(null);
    loadThresholds();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRow) return;
    try {
      const token = sessionStorage.getItem('token');
      const username = sessionStorage.getItem('username') || 'Occupancy';
      if (!token) throw new Error('Missing auth token in session');

      const res = await fetch(`${API_BASE}/settings/threshold/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, thresholdName: selectedRow.name }),
      });

      if (!res.ok) {
        let msg = '';
        const ct = res.headers?.get?.('content-type') || '';
        try {
          if (ct.includes('application/json')) {
            const d = await res.json();
            msg = d?.message || d?.error || d?.detail || JSON.stringify(d);
          } else {
            msg = await res.text();
          }
        } catch (_) { /* ignore */ }
        if (!msg) msg = res.statusText || `Request failed (${res.status})`;
        throw new Error(msg);
      }

      const data = await res.json();
      const rawMsg = String(data?.message || '').trim() || 'Threshold deleted successfully';
      const cleanedMsg = rawMsg.replace(/^✅\s*/u, '');
      const lower = cleanedMsg.toLowerCase();
      const isProtectedMsg = /configured\s+sms\/email\(s\).*cannot be deleted/i.test(cleanedMsg) || /cannot be deleted/i.test(cleanedMsg);
      if (isProtectedMsg) {
        // Show as warning (do not treat as success)
        toast.warning(cleanedMsg, {
          position: 'top-right',
          autoClose: 4000,
          theme: 'light',
        });
        // Close modal but keep current selection so user can act differently
        setShowDelete(false);
      } else {
        toast.success(` ${cleanedMsg}`, {
          position: 'top-right',
          autoClose: 3000,
          theme: 'light',
        });
        await loadThresholds();
        setShowDelete(false);
        setSelectedRow(null);
      }
    } catch (err) {
      console.error('Failed to delete threshold:', err);
      toast(` ${err?.message || 'Failed to delete threshold'}`, {
        position: 'top-right',
        autoClose: 3000,
        theme: 'light',
      });
    }
  };

  const handleDeleteClose = () => {
    setShowDelete(false);
    loadThresholds();
  };

  return (
    <MainLayout>
  <ToastContainer />
  <div><p><span className="top-tab-head">Threshold</span></p></div>
      <div className="new_card threshold-sec">
        <div className="threshold-toolbar">
          <SearchBar value={search} onChange={setSearch} />
          <div className="actions">
            <Buttons
              text="Edit Threshold"
              type="button"
              size="md"
              variant="light"
              className="btn-primary btn"             
              onClick={handleEdit}
              disabled={!selectedRow}
            />
            <Buttons
              text="Delete Threshold"
              type="button"
              size="md"
              variant="light"
              className="btn-primary btn"             
              onClick={handleDelete}
              disabled={!selectedRow}
            />
            <Buttons
              text="Add Threshold"
              type="button"
              size="md"
              variant="light"
              className="btn-primary btn"             
              onClick={handleAdd}
            />
          </div>
        </div>
        {error && (
          <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>
        )}
        {isLoading ? (
          <Loader />
        ) : (
          <ThresholdsTable
            thresholds={filtered}
            selectedRow={selectedRow}
            onSelectedChange={setSelectedRow}
          />
        )}
      </div>
      <ThresholdForm
        open={showForm}
        onClose={handleFormClose}
        onSave={handleSave}
        initialData={editData}
      />
      <DeleteThresholdModal
        open={showDelete}
        onClose={handleDeleteClose}
        onDelete={handleDeleteConfirm}
  thresholdName={selectedRow?.name}
      />
    </MainLayout>
  );
}
