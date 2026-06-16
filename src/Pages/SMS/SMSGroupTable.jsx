import React, { useEffect, useState, useCallback } from "react";
import AddSMSGroupModal from "./AddSMSGroupModal";
import EditSMSGroup from "./EditSMSGroup";
import DeleteSMSGroup from "./DeleteSMSGroup";
import "./EmailTab.css";
import DataTable from "react-data-table-component";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
// Prefer environment variable for API base, fallback to known dev host
const API_BASE = import.meta.env.VITE_API_URL || "http://delbi2dev.deloptanalytics.com:3000";

const SMSGroupTable = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [groups, setGroups] = useState([]);
  // state initialized; session reads happen inside handlers
      

  // Columns aligned to API output
  const columns = [
    {
      name: "SL",
      selector: (row) => row.sl ?? row.id,
      width: "80px",
    },
    {
      name: "GROUP(S)NAME",
      selector: (row) => row.name,
    },
  ];

  const fetchGrid = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const tokenVal = sessionStorage.getItem("token");
      const username =
        sessionStorage.getItem("username") ||
        sessionStorage.getItem("name") ||
        "TestUser"; // safe fallback for dev
      // const vid = sessionStorage.getItem("vid"); // available if needed
      console.log("Table Token in sessionStorage:", sessionStorage.getItem("token"));

      if (!tokenVal) {
        throw new Error("Missing auth token in session");
      }

      const res = await fetch(`${API_BASE}/settings/sms/gridView`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenVal}`,
        },
  body: JSON.stringify({ username: username }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with ${res.status}`);
      }

      const data = await res.json();

      // API shape example:
      // { success: true, message: "SMS Group Grid View", smsGroup: [[ { SL: "1", "GROUP(S)NAME": "Delopt32" } ]] }
      const nested = Array.isArray(data?.smsGroup) ? data.smsGroup : [];
      const items = nested.flat().filter(Boolean);
      const normalized = items.map((item, idx) => ({
        id: Number.parseInt(item?.SL, 10) || idx + 1,
        sl: item?.SL ?? String(idx + 1),
        name: item?.["GROUP(S)NAME"] || `Group ${idx + 1}`,
      }));

      setGroups(normalized);
    } catch (err) {
      console.error("Failed to load SMS grid:", err);
      setError(err?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGrid();
  }, [fetchGrid]);

  // auto-hide success messages
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(""), 3000);
    return () => clearTimeout(t);
  }, [success]);

  const filteredGroups = groups.filter((group) => {
    const name = (group?.name ?? "").toString().toLowerCase();
    const query = (searchTerm ?? "").toString().toLowerCase();
    return name.includes(query);
  });

  const handleAddGroup = async (groupData) => {
    setError("");
    setLoading(true);
    try {
      const tokenVal = sessionStorage.getItem("token");
      if (!tokenVal) throw new Error("Missing auth token in session");
      const username = sessionStorage.getItem("username");

      const zoneStr = Array.isArray(groupData.zones)
        ? Array.from(new Set(groupData.zones.map((z) => (z ?? "").toString().trim()))).filter(Boolean).join(",")
        : (groupData.zones ?? "").toString().trim();
      const contactStr = Array.isArray(groupData.contactNumbers)
        ? Array.from(new Set(groupData.contactNumbers.map((n) => (n ?? "").toString().trim()))).filter(Boolean).join(",")
        : (groupData.contactNumbers ?? "").toString().trim();

      const payload = {
        username: username,
        groupname: groupData.groupName,
  contactno: contactStr,
        contactname: groupData.contactName || "",
        zone: zoneStr,
        threshold: groupData.threshold,
      };

      // First attempt
      let res = await fetch(`${API_BASE}/settings/sms/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenVal}`,
        },
        body: JSON.stringify(payload),
      });

      // Retry once if unauthorized with a fresh token
      if (res.status === 401) {
        const newToken = sessionStorage.getItem("token");
        if (newToken && newToken !== tokenVal) {
          res = await fetch(`${API_BASE}/settings/sms/create`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newToken}`,
            },
            body: JSON.stringify(payload),
          });
        }
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with ${res.status}`);
      }

      // Close modal and refresh grid
      setShowAddModal(false);
    await fetchGrid();
  setSuccess(`Group "${groupData?.groupName ?? ""}" added`);
   toast.success("Group Added Successfully", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
    } catch (err) {
      console.error("Failed to create SMS group:", err);
      const msg = err?.message || "Failed to create group";
      setError(msg);
      toast.error(msg, { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  const handleEditGroup = async (updatedData) => {
    // Edit API call is already done inside EditSMSGroup; just refresh grid
    setError("");
    setLoading(true);
    try {
    await fetchGrid();
    const nameForMsg = updatedData?.groupname || updatedData?.groupName || updatedData?.name || "";
  setSuccess(`Group "${nameForMsg}" updated`);
   toast.success("Group Updated Successfully", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
    } catch (e) {
      // fetchGrid already sets error; also surface a toast
      const msg = e?.message || "Failed to update group";
      toast.error(msg, { position: "top-right" });
    } finally {
      setLoading(false);
      setShowEditModal(false);
      setSelectedGroup(null);
    }
  };

  // Delete selected group via API and refresh grid
  const handleDeleteGroup = async (group = selectedGroup) => {
    if (!group) return;
    setError("");
    setLoading(true);
    try {
      const tokenVal = sessionStorage.getItem("token");
      // Prefer 'username'; fall back to 'name' but also normalize it back into 'username'
      let username = sessionStorage.getItem("username");
      const nameFallback = sessionStorage.getItem("name");
      if (!username && nameFallback) {
        username = nameFallback;
        // Normalize for other API calls that expect 'username'
        sessionStorage.setItem("username", nameFallback);
      }
      if (!username) {
        throw new Error("Username not found in session. Please log in again.");
      }
      
      if (!tokenVal) throw new Error("Missing auth token in session");

      // Resolve group name from various possible props
      const resolvedGroupName = (
        group?.name ??
        group?.groupName ??
        group?.GroupName ??
        group?.GROUP?.name ??
        ""
      )
        .toString()
        .trim();
      if (!resolvedGroupName) {
        throw new Error("Group name is missing. Please reselect a group and try again.");
      }

      const payload = {
        username: (username ?? "").toString().trim(),
        groupname: resolvedGroupName,
      };

      let res = await fetch(`${API_BASE}/settings/sms/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenVal}`,
        },
        body: JSON.stringify(payload),
      });

      // Retry once if unauthorized using a possibly refreshed token
      if (res.status === 401) {
        const newToken = sessionStorage.getItem("token");
        if (newToken && newToken !== tokenVal) {
          res = await fetch(`${API_BASE}/settings/sms/delete`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newToken}`,
            },
            body: JSON.stringify(payload),
          });
        }
      }

      // Parse body and respect API-level success flag
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const text = data?.message || (await res.text());
        throw new Error(text || `Request failed with ${res.status}`);
      }
      if (data && data.success === false) {
        throw new Error(data.message || "Delete failed");
      }

  // Refresh grid after successful deletion
  await fetchGrid();
  setSuccess(`Group "${payload.groupname}" deleted`);
   toast.success("Group Name Deleted Successfully", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
    } catch (err) {
      console.error("Failed to delete SMS group:", err);
      const msg = err?.message || "Failed to delete group";
      setError(msg);
      toast.error(msg, { position: "top-right" });
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setSelectedGroup(null);
    }
  };

  const openEditModal = (group) => {
    setSelectedGroup(group);
    setShowEditModal(true);
  };

  const openDeleteModal = (group) => {
    setSelectedGroup(group);
    setShowDeleteModal(true);
  };

  return (
    <>
    <ToastContainer />
    <div className="group-table-container">
      {loading && <div style={{ marginBottom: 8 }}>Loading...</div>}
  {/* Hide inline API responses; using toasts instead */}
      <div className="group-table-header">
        <input
          className="search-input"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div>
          <button
            className="edit-btn"
            disabled={!selectedGroup}
            onClick={() => selectedGroup && openEditModal(selectedGroup)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
             Edit Group
          </button>
          <button
            className="delete-btn"
            disabled={!selectedGroup}
            onClick={() => selectedGroup && openDeleteModal(selectedGroup)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
             Delete Group
          </button>
          <button className="add-btn" onClick={() => setShowAddModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
             Add Group
          </button>
        </div>
      </div>



      <div style={{ overflowY: "scroll" }}>
        {/* const FixedHeaderStory = ({ fixedHeader, fixedHeaderScrollHeight }) => ( */}
        <DataTable
          columns={columns}
          data={filteredGroups}
          onRowClicked={(row) => setSelectedGroup(row)}
          highlightOnHover
          pointerOnHover
          selectableRowsHighlight
          conditionalRowStyles={[
            {
              when: (row) => selectedGroup && row.id === selectedGroup.id,
              style: { backgroundColor: "#f6f7fc" },
            },
          ]}
          pagination
          paginationPerPage={5}
          paginationRowsPerPageOptions={[5, 10, 15]}
        />
      </div>

      <AddSMSGroupModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddGroup}
      />

      <EditSMSGroup
        show={showEditModal}
        group={selectedGroup}
        onClose={() => {
          setShowEditModal(false);
          setSelectedGroup(null);
        }}
        onSubmit={handleEditGroup}
      />

      <DeleteSMSGroup
        show={showDeleteModal}
        group={selectedGroup}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedGroup(null);
        }}
        onConfirm={handleDeleteGroup}
      />
    </div>
    </>
  );
};

export default SMSGroupTable;
