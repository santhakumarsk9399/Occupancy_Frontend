import React, { useState, useEffect, useRef } from "react";
import { Tab, Nav, Button } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { FaPlus } from "react-icons/fa";
import SearchBar from "../CommonComponents/SearchBar";
import Buttons from "../CommonComponents/Button";
import ViewUser from "../Users/ViewUser";
import axios from "axios";
import Loader from "../CommonComponents/Loader";
import LicensingVendorFormModal from "./LicensingAddandUpdate";
import DeleteVendor from "./DeleteLicensing";
// import { toastError, toastSuccess } from "../CommonComponents/Toas";
import { ToastContainer, toast } from 'react-toastify';
import { showError, showSuccess } from "../CommonComponents/Toaster";
const Licensing = () => {
  // State declarations
  const [showModal, setShowModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [zoneQuery, setZoneQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [vendors, setVendors] = useState(null);
  const [editVendor, seteditVendor] = useState(null);
  const [userZones, setUserSelectedZones] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState({});
  const [zoneOptions, setZoneOptions] = useState([]);
  const [getUserProfile, setUserProfile] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem("token");
  const vid = sessionStorage.getItem("vid");
  const MainUsername = sessionStorage.getItem("username");
  const role = sessionStorage.getItem("role");

  const tableWrapperRef = useRef(null);
  const hasFetchedRef = useRef(false);


  // Detect click outside to reset selection
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        tableWrapperRef.current &&
        !tableWrapperRef.current.contains(event.target)
      ) {
        setSelectedRowId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Row style for selected row highlight
  const conditionalRowStyles = [
    {
      when: (row) => row.slno === selectedRowId,
      style: {
        backgroundColor: "#f6f7fc",
      },
    },
  ];

  // Fetch users, zones and profile data
  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/licensing/gridView`,  {
          headers: { Authorization: `Bearer ${token}` },
      })
      console.log(res)
      setVendors(res?.data?.data);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchVendors();
},[])
  // Get user profile info
  const GetVendorProfile = async (vendorData) => {
    try {
      let response = await axios.get(
        `${API_URL}/licensing/view`,
        {
          headers: { Authorization: `Bearer ${token}` }, params: vendorData
        }
      );
      seteditVendor(response.data);
      setSelectedVendor(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchVendors();
    // GetVendorProfile({ vid, username: MainUsername });
  }, []);

  // User action handlers
  const handleAddUser = () => {
    seteditVendor(null);
    setSelectedVendor(null);
    setShowModal(true);
  };

  const handleViewUser = () => {
    setSelectedVendor(null);
    let Viewuser =
      users != null
        ? users.filter((user) => user.sl === selectedRowId)
        : selectedRowId;
    const getpayload = { vid, username: Viewuser[0].username };
    GetVendorProfile(getpayload);
    setShowView(true);
  };

  // const handleEditClick = () => {
  //   if (!Array.isArray(vendors?.[0]) || !selectedRowId) return;

  //   const selectedVendor = vendors[0].find(
  //     (vendor) => vendor.slno === selectedRowId
  //   );
  //   if (!selectedVendor) {
  //     showError("Selected vendor not found");
  //     return;
  //   }

  //   const getpayload = {
  //     vendorname: selectedVendor.VendorName,
  //   };

  //   GetVendorProfile(getpayload);
  //   setShowModal(true);
  // };
  
  const handleEditClick = () => {
    if (!vendors || !selectedRowId) return;

    const selectedVendor = vendors.find(
      (vendor) => vendor.slno === selectedRowId
    );

    if (!selectedVendor) {
      showError("Selected vendor not found");
      return;
    }

    const getpayload = {
      vendorname: selectedVendor.VendorName,
    };

    GetVendorProfile(getpayload);
    setShowModal(true);
  };
  // const handleDeleteUser = async () => {
  //   if (!Array.isArray(vendors?.[0]) || !selectedRowId) return;

  //   const selectedVendor = vendors[0].find(
  //     (vendor) => vendor.slno === selectedRowId
  //   );
  //   if (!selectedVendor) {
  //     showError("Selected vendor not found");
  //     return;
  //   }
  //   setSelectedVendor(selectedVendor);
  //   setShowDeleteModal(true);
  // };
  const handleDeleteUser = () => {
    if (!vendors || !selectedRowId) return;

    const selectedVendor = vendors.find(
      (vendor) => vendor.slno === selectedRowId
    );

    if (!selectedVendor) {
      showError("Selected vendor not found");
      return;
    }

    setSelectedVendor(selectedVendor);
    setShowDeleteModal(true);
  };
  const handleDelete = async () => {
    fetchVendors();
  };

  const EditUserProfile = () => {
    setShowProfileModal(true);
  };

  const handleAddOrUpdate = async (formData) => {
    var msg;
    setIsSaving(true);

    let operation = editVendor ? "Update" : "Insert";

    const payload = {
      vendorname: formData.vendorName,
      vendorkey: formData.vendorKey,
      // noofunits: Number(formData.noOfUnits),
      // noofusers: Number(formData.noOfUsers),
      // validity: formData.validity,
      systemkey: formData.systemKey,
      remarks: formData.remarks || "",
      latitude: formData.latitude || "",
      longitude: formData.longitude || "",
      username: formData.username,
      useremailid: formData.userEmail,
      userpass: formData.userPassword,
      useraddress: formData.userAddress || "",
      healthmail: Number(formData.healthMail),
      selected: operation,
    };

    try {
      const response = await axios.post(
        `${API_URL}/licensing/createEditDelete`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
       const success = String(response?.data?.success).toLowerCase() === "true";
      if (success) {
        let responseMsg = (response?.data?.message[0].Message) || (editVendor ? "Vendor updated successfully" : "Vendor added successfully");
        console.log("toast is sTar")
          showSuccess(responseMsg);
          fetchVendors();
          seteditVendor(null);
          setShowModal(false);
            
      } else {
        let responseMsg = response?.data?.message || "Failed to save vendor license"
        showError(responseMsg)
      }
    } catch (error) {
      let responseMsg = error?.response?.data?.message || "Failed to save vendor license. Please try again."
      showError(responseMsg)
    } finally {
      setIsSaving(false);
    }
  };
  
  const filteredProducts =vendors ? vendors.filter((vendor) =>
        vendor["VendorName"]
          ?.toLowerCase()
          .includes(userQuery.toLowerCase())
      )
      : [];

  // console.log(vendors,filteredProducts)
  const columns = [
    { name: "Sl", selector: (row) => row.slno, width: "100px" },
    { name: "Vendor Name", selector: (row) => row.VendorName },
    { name: "User Name", selector: (row) => row.UserName },
    { name: "No.of Users", selector: (row) => row.NoOfUsers },
    { name: "No.of Units", selector: (row) => row.NoOfUnits },
    { name: "Vendor Key", selector: (row) => row.VendorKey },
    {
      name: "Validity",
      selector: (row) =>
        row.Validity
          ? new Date(row.Validity)
            .toLocaleDateString("en-GB")
            .split("/")
            .join("-")
          : "-",
    }
    
  ];

  // Custom DataTable styles
  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#ffffff",
        color: "black",
        fontWeight: "700",
        fontSize: "30px",
        // textTransform: "uppercase",
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
    <>
      {/* <ToastContainer /> */}
      <div className="Usercontainer">
        <div><p><span className="top-tab-head">Vendor Lists</span></p></div>
        <div className="tabsec">
          <Tab.Container defaultActiveKey="users">
            <Tab.Content className="bg-white border p-3 pt-2">
              <Tab.Pane eventKey="users">
                <div className="UserTable_TopSection" ref={tableWrapperRef}>
                  <div className="UserTable_Section">
                    <div className="searchandBtSection">
                      <div className="searchbarsec">
                        <SearchBar
                          placeholder="Search Vendors..."
                          onSearch={setUserQuery}
                        />
                      </div>
                      {role !== "Viewer" && (
                        <div className="buttonsSections">
                          <div className="p-0">
                            <>
                            
                               {/* <Buttons
                                text="View"
                                type="button"
                                size="md"
                                variant="primary"
                                onClick={handleViewUser}
                                icon={<FaPlus />}
                                disabled={!selectedRowId}
                              /> */}
                              <Buttons
                                text="Edit"
                                type="button"
                                size="md"
                                variant="primary"
                                onClick={handleEditClick}
                                icon={<FaPlus />}
                                disabled={!selectedRowId}
                              />
                              <Buttons
                                text="Delete"
                                type="button"
                                size="md"
                                variant="primary"
                                onClick={handleDeleteUser}
                                icon={<FaPlus />}
                                disabled={!selectedRowId}
                              />
                              <Buttons
                                text="Add Vendor"
                                type="button"
                                size="md"
                                variant="primary"
                                onClick={handleAddUser}
                                icon={<FaPlus />}
                              />
                            </>
                            <LicensingVendorFormModal
                              show={showModal}
                              handleClose={() => setShowModal(false)}
                              onSave={handleAddOrUpdate}
                              editingVendor={editVendor}
                              Zones={zoneOptions}
                              userdata={userZones}
                              isSaving={isSaving}
                            />

                            <DeleteVendor
                              show={showDeleteModal}
                              handleClose={() => setShowDeleteModal(false)}
                              vendor={selectedVendor}
                              onDelete={handleDelete}
                            />
                            <ViewUser
                              show={showView}
                              handleClose={() => setShowView(false)}
                              vendor={selectedVendor}
                              zones={userZones}
                            />
                          </div>
                        </div>
                      )}
                      {/* <EditProfile
                        show={showProfileModal}
                        handleClose={() => setShowProfileModal(false)}
                        onSave={UpdateProfile}
                        selectedMainuser={getUserProfile}
                        isSaving={isSaving}
                      /> */}
                    </div>
                    <div style={{ maxHeight: "600px", overflowY: "scroll" }}>
                      {isLoading ? (
                        <Loader />
                      ) : (
                        <DataTable
                            columns={columns}
                            data={filteredProducts}
                            onRowClicked={(row) => setSelectedRowId(row.slno)}
                            highlightOnHover
                            pointerOnHover
                            selectableRowsHighlight
                            conditionalRowStyles={conditionalRowStyles}
                            pagination
                            paginationPerPage={10}
                            paginationRowsPerPageOptions={[5, 10, 15]}
                            responsive
                            customStyles={customStyles}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </Tab.Pane>
              {/* )} */}
            </Tab.Content>
          </Tab.Container>
        </div>
      </div>
    </>
  );
};

export default Licensing;
