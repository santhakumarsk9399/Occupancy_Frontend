import React, { useState, useEffect, useRef } from "react";
import DataTable from "react-data-table-component";
import "../../Components/Styles/Table.css";
import { Tab, Nav, Table, Button, Form } from "react-bootstrap";
import SearchBar from "../CommonComponents/SearchBar";
import Buttons from "../CommonComponents/Button";
import { FaEye, FaEdit, FaTrash, FaPlus, FaRedo } from "react-icons/fa";
import "../../Components/Styles/CustomButtons.css";
import "./ZoneStyle.css";
import AddZone from "./AddZones";
import EditZone from "./EditZone";
import ResetCountModal from "./ResetCountModal";
import DeleteZoneModal from "./DeleteZoneModal";
import ServiceAreaModal from "./ServiceAreaModal";
import Loader from "../CommonComponents/Loader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Prefer environment variable for API base, fallback to known dev host
const API_BASE = import.meta.env.VITE_API_URL || "http://delbi2dev.deloptanalytics.com:3000";
export default function GetAllZoneList() {
  const [showModal, setShowModal] = useState(false); // add popup modal
  const [showDeleteModal, setShowDeleteModal] = useState(false); // delete popup modal
  const [showView, setShowView] = useState(false); // View popup modal
  const [query, setQuery] = React.useState(""); // search option
  const tableWrapperRef = useRef(null); // div wrapper
  const [zones, setZones] = useState(null); // add Zone
  const [editZone, seteditZone] = useState(null); // edit Zone
  const [selectedZone, setSelectedZone] = useState({}); // selected Zone
  const [selectedRowId, setSelectedRowId] = useState(null); // Selected Row
  const [showReset, setShowReset] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showServiceArea, setShowServiceArea] = useState(false);
  const [serviceAreaZone, setServiceAreaZone] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const columns = [
    {
      name: "SL",
      selector: (row) => row.id,
    },
    {
      name: "Zone(s) Name",
      selector: (row) => row.zoneName,
    },
    {
      name: "Address",
      selector: (row) => row.country + ","+ row.city,
    },
  ];
  //---------------------filter the users for search option-----------------------------------------
  const filteredProducts =
    zones != null
      ? zones.filter(
          (zones) =>
            zones.zoneName &&
            zones.zoneName.toLowerCase().includes(query.toLocaleLowerCase())
        )
      : [];
console.log(filteredProducts)
  // ----------------- Detect click outside table and reset selected row-----------------------------
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If any modal is open, don't clear selection — user is interacting with the modal
      if (showDelete || showReset || showEditModal || showModal || showServiceArea) return;

      if (
        tableWrapperRef.current &&
        !tableWrapperRef.current.contains(event.target)
      ) {
        setSelectedRowId(null);
        setSelectedZone({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDelete, showReset, showEditModal, showModal, showServiceArea]);

  // -----------------Highlight selected row background color-------------------------------------------
  const conditionalRowStyles = [
    {
  when: (row) => row.id === selectedRowId || row.zoneName === selectedRowId,
      style: {
        backgroundColor: "#f6f7fc",
      },
    },
  ];
  
  // handle row select via click
  const handleRowClick = (row) => {
    setSelectedRowId(row.id ?? row.zoneName ?? null);
    setSelectedZone(row);
  };

  // Fetch full zone details for ServiceAreaModal
  const handleViewServiceArea = async () => {
    if (!selectedZone?.zoneName) return;
    setServiceAreaZone(null);
    setShowServiceArea(true);
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE}/settings/zones/getZone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ zonename: selectedZone.zoneName }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || `Failed to load zone details (${res.status})`);
      }
      const meta = Array.isArray(data?.metaData) && data.metaData[0] ? data.metaData[0] : {};
      const mappedEntry = Array.isArray(data?.mappedEntry) ? data.mappedEntry : [];
      const mappedExit = Array.isArray(data?.mappedExit) ? data.mappedExit : [];
      const entryList = mappedEntry.map((o) => o?.ServiceAreaMappedEntry || "").filter(Boolean);
      const exitList = mappedExit.map((o) => o?.ServiceAreaMappedExit || "").filter(Boolean);
      setServiceAreaZone({
        ...selectedZone,
        serviceAreaEntry: entryList,
        serviceAreaExit: exitList,
      });
    } catch (err) {
      toast.error(err?.message || "Failed to load service area details", { position: "top-right" });
      setServiceAreaZone({ ...selectedZone, serviceAreaEntry: [], serviceAreaExit: [] });
    }
  };

  // whether a row is currently selected (used for button enable/disable)
  const isRowSelected = Boolean(selectedRowId || (selectedZone && selectedZone.zoneName));
  //-------------------------Stored in local storage + API load-----------------------------------------------------
  const LOCAL_KEY = "zone_data";

  // Load grid from API; fallback to localStorage on failure
  useEffect(() => {
    let cancelled = false;
    const fetchZones = async () => {
      setIsLoading(true);
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch(`${API_BASE}/settings/zones/getZones`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ vid: 4 }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Request failed with ${res.status}`);
        }
        const data = await res.json();
        // API returns: { success, message, zones: [[{ SL, "Zone(s)name", Address }, ...]] }
        const nested = Array.isArray(data?.zones) ? data.zones : [];
        const flat = nested.flat().filter(Boolean);
        const mapped = flat.map((item) => {
          const addr = String(item?.Address || "");
          let country = "";
          let city = "";
          if (addr.includes(",")) {
            const parts = addr.split(",");
            country = (parts[0] || "").trim();
            city = parts.slice(1).join(",").trim();
          } else {
            country = addr.trim();
          }
          return {
            id: Number(item?.SL) || undefined,
            zoneName: item?.["Zone(s)name"] || item?.zoneName || "",
            country,
            city,
          };
        });
        if (!cancelled) {
          setZones(mapped);
          // Persist for offline/fallback
          try { localStorage.setItem(LOCAL_KEY, JSON.stringify(mapped)); } catch (_) {}
        }
      } catch (err) {
        console.error("Failed to load zones:", err);
        if (!cancelled) {
          // Fallback: try localStorage
          try {
            const item = localStorage.getItem(LOCAL_KEY);
            const stored = item ? JSON.parse(item) : [];
            setZones(Array.isArray(stored) ? stored : []);
          } catch (_) {
            setZones([]);
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchZones();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveToLocal = (data) => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  };

    const handleAddZones = () => {
    seteditZone(null);
    setShowModal(true);
  };
//----------------------- Handling Add user ----------------------------------------------------------------
  const handleAddOrUpdateZone = (formData) => {
    let updated;
    if (editZone) {
      // Update existing user
      updated = zones.map((ezone) => {
        const idMatch = ezone.id != null && editZone.id != null && ezone.id === editZone.id;
        const nameMatch = String(ezone.zoneName).toLowerCase() === String(editZone.zoneName).toLowerCase();
        return idMatch || nameMatch ? { ...ezone, ...formData } : ezone;
      });
      setZones(updated);
      seteditZone(null);
    } else {
      // Add new user
      const newZone = { ...formData, id: zones ? zones.length + 1 : 1 };
      
      zones? updated = [...zones, newZone] : updated = [newZone] 
      setZones(updated);
    }

    saveToLocal(updated);
    console.log(updated);
    // setEditIndex(null);
  };
//------------------------------- Edit Zones --------------------------------------------------------------------

  // accept an optional zone passed directly (e.g., from modal button)
  const handleEditClick = (passedZone) => {
    if (!zones) return;
    let vzone = passedZone || null;
    if (!vzone) {
      if (selectedRowId != null) {
        vzone = zones.find((zone) => zone.id === selectedRowId || zone.zoneName === selectedRowId) || null;
      }
      if (!vzone && selectedZone?.zoneName) {
        vzone = zones.find((zone) => zone.zoneName === selectedZone.zoneName) || null;
      }
    }
    if (!vzone) return;
    seteditZone(vzone);
    setShowEditModal(true);
  };

  const handleOpenReset = () => {
    if (!selectedRowId) return;
    setShowReset(true);
  };

  const handleSubmitReset = async (resetCount, passedZone) => {
    try {
      // Validate input & selection
      if (resetCount == null || Number.isNaN(Number(resetCount))) {
        toast.error("Enter a valid number to reset.", { position: "top-right" });
        return;
      }
      // allow modal to pass a zone in case selection was cleared
  // If modal passed a zone as second arg, prefer it; otherwise fall back to selectedZone.
  const zoneToUse = passedZone || selectedZone;
      if (!zoneToUse?.zoneName) {
        toast.error("Select a zone first.", { position: "top-right" });
        return;
      }

      const token = sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE}/settings/zones/resetCountZone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ resetCount: Number(resetCount), zonename: zoneToUse.zoneName }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        const msg = data?.message || `Failed to reset count (${res.status})`;
        throw new Error(msg);
      }
  toast.success(data?.message || "Zone count reset successfully", { position: "top-right" });
  setShowReset(false);
    } catch (err) {
  toast.error(err?.message || "Failed to reset count", { position: "top-right" });
    }
  };

  const handleOpenDelete = () => {
    // debug: ensure a zone is selected when opening delete modal
    // eslint-disable-next-line no-console
    console.log("handleOpenDelete called", { selectedZone });
    if (!selectedZone?.zoneName) {
      // eslint-disable-next-line no-console
      console.log("handleOpenDelete aborted: no selectedZone.zoneName");
      return;
    }
    setShowDelete(true);
  };

  const handleConfirmDelete = async (passedZone) => {
    // allow caller to pass the zone (modal) or fallback to current selection
    const currentZone = passedZone || selectedZone;
    // debug: log invocation and current selection
    // eslint-disable-next-line no-console
    console.log("handleConfirmDelete invoked", { selectedZone: currentZone, zonesLength: zones ? zones.length : 0 });
    if (!zones || !currentZone?.zoneName) {
      // eslint-disable-next-line no-console
      console.log("handleConfirmDelete aborted: missing zones or selectedZone.zoneName");
      return;
    }
    const token = sessionStorage.getItem("token");
    const vid = Number(sessionStorage.getItem("vid")) || 4;
    const username = sessionStorage.getItem("username") || "Occupancy";
    try {
      const res = await fetch(`${API_BASE}/settings/zones/deleteZone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ vid, username, zonename: currentZone.zoneName }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        const msg = data?.message || `Failed to delete zone (${res.status})`;
        throw new Error(msg);
      }
  toast.success(data?.message || "Zone deleted successfully", { position: "top-right" });
  const targetName = String(currentZone.zoneName).toLowerCase();
  const updated = zones.filter((z) => String(z.zoneName).toLowerCase() !== targetName);
      setZones(updated);
      saveToLocal(updated);
      setShowDelete(false);
      setSelectedRowId(null);
      setSelectedZone({});
    } catch (err) {
  toast.error(err?.message || "Failed to delete zone", { position: "top-right" });
    }
  };
  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#ffffff",
        color: "black",
        fontWeight: "300",
        fontSize: "14px",
        textTransform: "uppercase",
        borderBottom: "2px solid #ddd",
        fontFamily: "Inter, sans-serif",
      },
    },
    cells: {
      style: {
        fontSize: "16px",
        fontWeight: "400",
        padding: "10px 15px",
        fontFamily: "Inter, sans-serif",
      },
    },
    rows: {
      style: {
        minHeight: "48px",
        "&:hover": {
          backgroundColor: "#f0f9ff",
          cursor: "pointer",
          fontFamily: "Inter, sans-serif",
        },
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid #ddd",
        padding: "10px",
        fontFamily: "Inter, sans-serif",
      },
    },
  };
  return (
    <div className="Usercontainer">

   
        <div><p><span class="top-tab-head">Zone Lists</span></p></div>

      <div className="tabsec">
        
       

        <Tab.Container defaultActiveKey="zones">
         {/*
          <Nav variant="tabs" >
            
             {/*<Nav.Item>
               <Nav.Link eventKey="zones">Zone Lists</Nav.Link> 
            </Nav.Item>*/}

            {/* <Nav.Item>
              <Nav.Link eventKey="zones">Zone(s)</Nav.Link>
            </Nav.Item> */}

          {/*</Nav> */}

          <Tab.Content className="bg-white border p-3">
            {/* <Tab.Pane eventKey="zones"></Tab.Pane> */}
            <Tab.Pane eventKey="zones">
              <div className="Zone_TopSection" ref={tableWrapperRef}>
                {/* <h1>All Users</h1> */}
                <div className="Zone_Section">
                  <div className="searchandBtSection">
                    <div className="searchbarsec">
                      <SearchBar
                        placeholder="Search Zones..."
                        onSearch={setQuery}
                      />
                    </div>
                    <div className="buttonsSections">
                      <div className="pb-2">
                        <Buttons
                          text="View Service Area Entry/Exit"
                          type="button"
                          size="md"
                          variant="light"
                          className="btn-primary"                          
                          onClick={handleViewServiceArea}
                          disabled={!isRowSelected}
                        />{" "}
                        <Buttons
                          text="Edit Zone"
                          type="button"
                          size="md"
                          variant="light"
                          className="btn-primary"
                          onClick={() => handleEditClick(selectedZone)}                         
                          disabled={!isRowSelected}
                        />{" "}
                        <Buttons
                          text="Delete Zone"
                          type="button"
                          size="md"
                          variant="light"
                          className="btn-primary"
                          onClick={handleOpenDelete}                          
                          disabled={!isRowSelected}
                        />{" "}
                        <Buttons
                          text="Reset Counts"
                          type="button"
                          size="md"
                          variant="light"
                          className="btn-primary"
                          onClick={handleOpenReset}                          
                          disabled={!isRowSelected}
                        />{" "}
                        <Buttons
                          text="Add Zone"
                          type="button"
                          size="md"
                          variant="light"
                          className="btn-primary"
                          onClick={handleAddZones}                          
                        />{" "}
                         <AddZone
                          show={showModal}
                          handleClose={() => setShowModal(false)}
                          onSave={handleAddOrUpdateZone}
                          zones={zones}
                          editingZone={editZone}
                        />
                        <EditZone
                          show={showEditModal}
                          handleClose={() => setShowEditModal(false)}
                          onSave={handleAddOrUpdateZone}
                          zones={zones}
                          editingZone={editZone}
                        />
                        {/* <DeleteUserModal
                          show={showDeleteModal}
                          onClose={() => setShowDeleteModal(false)}
                          user={selectedUser}
                          onDelete={handleDelete}
                        />
                        <ViewUser
                          show={showView}
                          handleClose={() => setShowView(false)}
                          user={selectedUser}
                        />  */}
                      </div>
                    </div>
                  </div>
                  <div style={{ maxHeight: "650px", overflowY: "scroll" }}>
                    {isLoading ? (
                      <Loader />
                    ) : (
                      <DataTable
                        columns={columns}
                        data={filteredProducts}
                        onRowClicked={handleRowClick}
                        highlightOnHover
                        pointerOnHover
                        selectableRowsHighlight
                        conditionalRowStyles={conditionalRowStyles}
                        pagination
                        paginationPerPage={10}
                        paginationRowsPerPageOptions={[10, 20, 30]}
                        responsive
                        customStyles ={customStyles}
                      />
                    )}
                  </div>
                </div>
              </div>
              {/* <p>Camera data section (you can customize this).</p> */}
              <ResetCountModal
                show={showReset}
                zone={selectedZone}
                zoneName={selectedZone?.zoneName}
                onCancel={() => setShowReset(false)}
                onSubmit={handleSubmitReset}
              />
              <DeleteZoneModal
                show={showDelete}
                onClose={() => setShowDelete(false)}
                zone={selectedZone}
                onDelete={handleConfirmDelete}
              />
              <ServiceAreaModal
                show={showServiceArea}
                onClose={() => setShowServiceArea(false)}
                zone={serviceAreaZone}
                zoneName={serviceAreaZone?.zoneName}
                entryList={serviceAreaZone?.serviceAreaEntry}
                exitList={serviceAreaZone?.serviceAreaExit}
              />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
  <ToastContainer position="top-center" />
      </div>
    </div>
  );
}

