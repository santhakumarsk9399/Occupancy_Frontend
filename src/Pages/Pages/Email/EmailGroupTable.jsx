// import React, { useState, useEffect, useRef } from "react";
// import DataTable from "react-data-table-component";
// import AddEmailGroupModal from "./AddEmailGroupModal";
// import EditEmailGroup from "./EditEmailGroup";
// import GroupSavedModal from "./GroupSavedModal";
// import DeleteEmailGroup from "./DeleteEmailGroup";
// import "./EmailTab.css";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const API_BASE =
//   import.meta.env.VITE_API_URL || "http://delbi2dev.deloptanalytics.com:3000";
// const API_URL = `${API_BASE}/settings/email/grid`;

// const EmailGroupTable = () => {
//   const [groups, setGroups] = useState([]);
//   const [filter, setFilter] = useState("");
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showSavedModal, setShowSavedModal] = useState(false);
//   const [selectedGroup, setSelectedGroup] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);

//   // Fetch groups from API (POST request)
//   const fetchGroups = () => {
//     const token = sessionStorage.getItem("token");
//     const username = sessionStorage.getItem("username");
//     const headers = {
//       "Content-Type": "application/json",
//       ...(token && { Authorization: `Bearer ${token}` }),
//     };

//     fetch(API_URL, {
//       method: "POST",
//       headers,
//       body: JSON.stringify({ username: username }),
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         console.log("Fetched data:", data);
//         // Prefer smtpData; fallback to smsGroup for backward compatibility
//         if (data?.smtpData && Array.isArray(data.smtpData[0])) {
//           setGroups(data.smtpData[0]);
//         } else if (data?.smsGroup && Array.isArray(data.smsGroup[0])) {
//           setGroups(data.smsGroup[0]);
//         } else {
//           setGroups([]);
//         }
//       })
//       .catch((err) => console.error("Failed to fetch groups", err));
//   };

//   useEffect(() => {
//     fetchGroups();
//   }, []);

//   // Refresh when ALL popups are closed (align with Zones behavior)
//   const anyModalOpen = showAddModal || showEditModal || showDeleteModal || showSavedModal;
//   const prevAnyOpenRef = useRef(anyModalOpen);
//   useEffect(() => {
//     if (!anyModalOpen && prevAnyOpenRef.current) {
//       // transitioned from open -> all closed
//       fetchGroups();
//     }
//     prevAnyOpenRef.current = anyModalOpen;
//   }, [anyModalOpen]);

//   const filteredGroups = groups.filter((group) => {
//     const groupName = group["GROUP(S) NAME"] || "";
//     const searchTerm = filter.trim().toLowerCase();
//     return groupName.toLowerCase().includes(searchTerm);
//   });

//   const handleAdd = () => setShowAddModal(true);
//   const handleEdit = () => selectedGroup && setShowEditModal(true);
//   const handleDelete = () => setShowDeleteModal(true);

//   const confirmDelete = async () => {
//     if (!selectedGroup) return;
//     try {
//       const token = sessionStorage.getItem("token");
//       const usernameRaw = (sessionStorage.getItem("username") || "").toString().trim();
//       const username = usernameRaw.length > 0 ? usernameRaw : "TestUser";
//       const groupname = (selectedGroup["GROUP(S) NAME"] || "").toString().trim();
//       if (!groupname) {
//         toast.error("Missing group name", { position: "top-right" });
//   setShowDeleteModal(false);
//         return;
//       }

//       const res = await fetch(`${API_BASE}/settings/email/delete`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         body: JSON.stringify({ username, groupname }),
//       });

//       const raw = await res.text();
//       let data = {};
//       try { data = raw ? JSON.parse(raw) : {}; } catch {}

//       if (!res.ok) {
//         throw new Error(data?.message || raw || `Delete failed (${res.status})`);
//       }

//       const message = String(data?.message || "");
//       // Zone-like warning: backend returns success with a cannot-delete message
//       if (/cannot be deleted/i.test(message)) {
//         toast.warning(message, { position: "top-right" });
//         // Close popup even on warning per new requirement
//         setShowDeleteModal(false);
//         return;
//       }

//   // success path (deleted)
//   toast.success(message || `Group "${groupname}" deleted`, { position: "top-right" });
//       setShowDeleteModal(false);
//       setSelectedGroup(null);
//     } catch (err) {
//       console.error("Email group delete failed:", err);
//       toast.error(err?.message || "Failed to delete group", { position: "top-right" });
//       // Close popup even on error as per requirement
//       setShowDeleteModal(false);
//     }
//   };
//   const cancelDelete = () => setShowDeleteModal(false);
//   // DataTable columns
//   const columns = [
//     {
//       name: "SL",
//       selector: (row) => row.SL,
//       sortable: true,
//       width: "80px",
//     },
//     {
//       name: "GROUP(S) NAME",
//       selector: (row) => row["GROUP(S) NAME"],
//       sortable: true,
//     }
//   ];

//   return (
//     <>
//       <ToastContainer />
//       <div className="group-table-container">
//       {/* Search + Buttons */}
//       <div className="group-table-header">
//         <input
//           className="search-input"
//           placeholder="Search"
//           value={filter}
//           onChange={(e) => {
//             setFilter(e.target.value);
//             setSelectedGroup(null);
//           }}
//         />
//         <div>
//           <button
//             className="edit-btn"
//             disabled={!selectedGroup}
//             onClick={handleEdit}
//           >
//             Edit Group
//           </button>
//           <button
//             className="delete-btn"
//             disabled={!selectedGroup}
//             onClick={handleDelete}
//           >
//             Delete Group
//           </button>
//           <button className="add-btn" onClick={handleAdd}>
//             + Add Group
//           </button>
//         </div>
//       </div>

//       {/* DataTable */}
//        <div style={{ overflowY: "scroll" }}>
//         {/* const FixedHeaderStory = ({ fixedHeader, fixedHeaderScrollHeight }) => ( */}
//         <DataTable
//           keyField="SL"
//           columns={columns}
//           data={filteredGroups}
//           onRowClicked={(row) => setSelectedGroup(row)}
//           highlightOnHover
//           pointerOnHover
//           selectableRowsHighlight
//           conditionalRowStyles={[
//             {
//               when: (row) => selectedGroup && row.SL === selectedGroup.SL,
//               style: { backgroundColor: "#f6f7fc" },
//             },
//           ]}
//           pagination
//           paginationPerPage={10}
//           paginationRowsPerPageOptions={[5, 10, 15]}
//         />
//       </div>

//       {/* Modals */}
//   {showAddModal && (
//     <AddEmailGroupModal
//           show={showAddModal}
//           onClose={() => setShowAddModal(false)}
//           onSave={() => {
//             setShowAddModal(false);
//           }}
//         />
//       )}
//     {showEditModal && selectedGroup && (
//     <EditEmailGroup
//           groupId={selectedGroup.SL}
//       groupName={selectedGroup["GROUP(S) NAME"]}
//           onClose={() => setShowEditModal(false)}
//           onSave={() => {
//     setShowEditModal(false);
//           }}
//         />
//       )}
//       <GroupSavedModal
//         show={showSavedModal}
//         onClose={() => setShowSavedModal(false)}
//       />
//       {showDeleteModal && selectedGroup && (
//         <DeleteEmailGroup
//           onCancel={cancelDelete}
//           onDelete={confirmDelete}
//           groupName={selectedGroup["GROUP(S) NAME"]}
//         />
//       )}
//       </div>
//     </>
//   );
// };

// export default EmailGroupTable;

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

  const filteredGroups = groups.filter((group) => {
    const groupName = group["GROUP(S) NAME"] || "";
    const searchTerm = filter.trim().toLowerCase();
    return groupName.toLowerCase().includes(searchTerm);
  });

  const handleAdd = () => setShowAddModal(true);
  const handleEdit = () => selectedGroup && setShowEditModal(true);
  const handleDelete = () => setShowDeleteModal(true);

  const confirmDelete = async () => {
    if (!selectedGroup) return;
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
        toast.error("Missing group name", { position: "top-center" });
        setShowDeleteModal(false);
        return;
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
        throw new Error(data?.message || raw || `Delete failed (${res.status})`);
      }

      const message = String(data?.message || "");
      if (/cannot be deleted/i.test(message)) {
        toast.warning(message, { position: "top-center" });
        setShowDeleteModal(false);
        return;
      }

      // success
      toast.success(message || `Group "${groupname}" deleted`, {
        position: "top-center",
      });
      setShowDeleteModal(false);
      setSelectedGroup(null);
    } catch (err) {
      console.error("Email group delete failed:", err);
      toast.error(err?.message || "Failed to delete group", {
        position: "top-center",
      });
      setShowDeleteModal(false);
    }
  };

  const cancelDelete = () => setShowDeleteModal(false);

  const columns = [
    {
      name: "SL",
      selector: (row) => row.SL,
      sortable: true,
      width: "80px",
    },
    {
      name: "GROUP(S) NAME",
      selector: (row) => row["GROUP(S) NAME"],
      sortable: true,
    },
  ];

  return (
    <>
      <ToastContainer />
      <div className="group-table-container">
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
            paginationRowsPerPageOptions={[10, 15]}
          />
        </div>

        {/* Modals */}
        {showAddModal && (
          <AddEmailGroupModal
            show={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSave={() => {
              setShowAddModal(false);
              toast.success("Email group added", {
                position: "top-center",
                autoClose: 3000,
              });
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
              toast.success("Email group updated", {
                position: "top-center",
                autoClose: 3000,
              });
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
