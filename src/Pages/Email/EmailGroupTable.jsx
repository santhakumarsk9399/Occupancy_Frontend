import React, { useState, useEffect, useRef } from "react";
import DataTable from "react-data-table-component";
import AddEmailGroupModal from "./AddEmailGroupModal";
import EditEmailGroup from "./EditEmailGroup";
import GroupSavedModal from "./GroupSavedModal";
import DeleteEmailGroup from "./DeleteEmailGroup";
import "./EmailTab.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://delbi2dev.deloptanalytics.com:3000";
const API_URL = `${API_BASE}/settings/email/grid`;

const EmailGroupTable = () => {
  const [groups, setGroups] = useState([]);
  const [filter, setFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // Track previous modal open state to refresh list when all modals close (same as Zones)
  const prevAnyModalOpenRef = useRef(false);
  // Wrapper ref to detect outside clicks (same approach as Zones)
  const tableWrapperRef = useRef(null);

  // Fetch groups from API (POST request)
  const fetchGroups = () => {
    const token = sessionStorage.getItem("token");
    const username = sessionStorage.getItem("username");
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    fetch(API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ username: username }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched data:", data);
        // Prefer smtpData; fallback to smsGroup for backward compatibility
        if (data?.smtpData && Array.isArray(data.smtpData[0])) {
          setGroups(data.smtpData[0]);
        } else if (data?.smsGroup && Array.isArray(data.smsGroup[0])) {
          setGroups(data.smsGroup[0]);
        } else {
          setGroups([]);
        }
      })
      .catch((err) => console.error("Failed to fetch groups", err));
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Clear selected row when clicking outside the table+buttons wrapper, unless a modal is open
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't clear while interacting with modals
      if (showAddModal || showEditModal || showDeleteModal || showSavedModal) return;
      if (tableWrapperRef.current && !tableWrapperRef.current.contains(event.target)) {
        setSelectedGroup(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAddModal, showEditModal, showDeleteModal, showSavedModal]);

  // Refetch whenever any Email modal transitions from open -> all closed
  useEffect(() => {
    const anyOpen = showAddModal || showEditModal || showDeleteModal || showSavedModal;
    if (prevAnyModalOpenRef.current && !anyOpen) {
      // A modal just closed -> refresh groups list and clear selection
      fetchGroups();
      setSelectedGroup(null);
    }
    prevAnyModalOpenRef.current = anyOpen;
  }, [showAddModal, showEditModal, showDeleteModal, showSavedModal]);

  // Refresh when ALL popups are closed
  const anyModalOpen =
    showAddModal || showEditModal || showDeleteModal || showSavedModal;
  const prevAnyOpenRef = useRef(anyModalOpen);
  useEffect(() => {
    if (!anyModalOpen && prevAnyOpenRef.current) {
      // transitioned from open -> all closed
      fetchGroups();
    }
    prevAnyOpenRef.current = anyModalOpen;
  }, [anyModalOpen]);

  // Search logic: preserve spaces so a single space filters only names containing a space
  // (previously trim() caused any space-only input to match all). Empty string still returns all.
  const filteredGroups = groups.filter((group) => {
    const groupName = (group["GROUP(S) NAME"] || "").toLowerCase();
    const searchTerm = filter.toLowerCase();
    if (searchTerm === "") return true; // show all when input actually empty
    return groupName.includes(searchTerm);
  });

  const handleAdd = () => setShowAddModal(true);
  const handleEdit = () => selectedGroup && setShowEditModal(true);
  const handleDelete = () => setShowDeleteModal(true);

  const confirmDelete = async () => {
    if (!selectedGroup) return { success: false, message: 'No group selected' };
    try {
      const token = sessionStorage.getItem("token");
      const usernameRaw = (sessionStorage.getItem("username") || "")
        .toString()
        .trim();
      const username = usernameRaw.length > 0 ? usernameRaw : "TestUser";
      const groupname = (selectedGroup["GROUP(S) NAME"] || "")
        .toString()
        .trim();
      if (!groupname) {
        return { success: false, message: 'Missing group name' };
      }

      const res = await fetch(`${API_BASE}/settings/email/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ username, groupname }),
      });

      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {}

      if (!res.ok) {
        return { success: false, message: data?.message || raw || `Delete failed (${res.status})` };
      }

      const message = String(data?.message || "");
      if (/cannot be deleted/i.test(message)) {
        return { success: false, message };
      }

      // success
      setSelectedGroup(null);
      return { success: true, message: message || `Group "${groupname}" deleted` };
    } catch (err) {
      console.error("Email group delete failed:", err);
      return { success: false, message: err?.message || 'Failed to delete group' };
    }
  };

  const cancelDelete = () => setShowDeleteModal(false);

  const columns = [
    {
      name: "SL",
      selector: (row) => row.SL,
      width: "80px",
    },
    {
      name: "GROUP(S) NAME",
      selector: (row) => row["GROUP(S) NAME"],
    },
  ];

  return (
    <>
      {/* Scoped toast container for Email Group only */}
      <ToastContainer
        containerId="email-group"
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        draggable
        pauseOnHover={false}
        pauseOnFocusLoss={false}
        toastStyle={{ textAlign: "center" }}
        style={{ zIndex: 13000 }}
      />
  <div className="group-table-container" ref={tableWrapperRef}>
        {/* Search + Buttons */}
        <div className="group-table-header">
          <input
            className="search-input"
            placeholder="Search"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setSelectedGroup(null);
            }}
          />
          <div>
            <button
              className="edit-btn"
              disabled={!selectedGroup}
              onClick={handleEdit}
            >
              Edit Group
            </button>
            <button
              className="delete-btn"
              disabled={!selectedGroup}
              onClick={handleDelete}
            >
              Delete Group
            </button>
            <button className="add-btn" onClick={handleAdd}>
              Add Group
            </button>
          </div>
        </div>

        {/* DataTable */}
        <div style={{ overflowY: "scroll", maxHeight: "550px" }}>
          <DataTable
            keyField="SL"
            columns={columns}
            data={filteredGroups}
            onRowClicked={(row) => setSelectedGroup(row)}
            highlightOnHover
            pointerOnHover
            selectableRowsHighlight
            conditionalRowStyles={[
              {
                when: (row) => selectedGroup && row.SL === selectedGroup.SL,
                style: { backgroundColor: "#f6f7fc" },
              },
            ]}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 15,20]}
          />
        </div>

        {/* Modals */}
        {showAddModal && (
          <AddEmailGroupModal
            show={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSave={() => {
              setShowAddModal(false);
              // toast.success("Email group added", {
              //   position: "top-center",
              //   autoClose: 3000,
              // });
            }}
          />
        )}
        {showEditModal && selectedGroup && (
          <EditEmailGroup
            groupId={selectedGroup.SL}
            groupName={selectedGroup["GROUP(S) NAME"]}
            onClose={() => setShowEditModal(false)}
            onSave={() => {
              setShowEditModal(false);
              // toast.success("Email group updated", {
              //   position: "top-center",
              //   autoClose: 3000,
              // });
            }}
          />
        )}
        <GroupSavedModal
          show={showSavedModal}
          onClose={() => setShowSavedModal(false)}
        />
        {showDeleteModal && selectedGroup && (
          <DeleteEmailGroup
            onCancel={cancelDelete}
            onDelete={confirmDelete}
            groupName={selectedGroup["GROUP(S) NAME"]}
          />
        )}
      </div>
    </>
  );
};

export default EmailGroupTable;
