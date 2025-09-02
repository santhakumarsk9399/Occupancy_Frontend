import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import DataTable from "react-data-table-component";
import SearchBar from "../CommonComponents/SearchBar";
import "../../Components/Styles/UsersPage.css";
import viewprofileimg from "../../Components/Assets/users/userprofile_1.png";

const ViewUser = ({ show, handleClose, user }) => {
  const [query, setQuery] = useState(""); // Search query
  const [userdata, setUserdata] = useState({});
  const [allZones, setAllZones] = useState([]);

  // Reset search and populate data when modal opens or user changes
  useEffect(() => {
    if (show) {
      setQuery(""); // Reset search query when modal opens
    }

    if (Array.isArray(user?.user) && user.user.length > 0) {
      setUserdata(user.user[0]);
    }
    if (Array.isArray(user?.mappedZones)) {
      setAllZones(user.mappedZones);
    }
  }, [show, user]);

  const filteredZones =
    allZones != null
      ? allZones.filter((zone) =>
          zone.zonename?.toLowerCase().includes(query.toLowerCase())
        )
      : [];

  const columns = [
    { name: "SL", selector: (row) => row.SL, width: "100px" },
    { name: "ZONE NAME", selector: (row) => row.zonename },
  ];

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
    <Modal show={show} onHide={handleClose} centered backdrop="static" size="lg">
      <Modal.Header closeButton className="pb-1">
        <Modal.Title>View User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex align-items-start">
          <div className="d-flex profilesec">
            <div>
              {viewprofileimg ? (
                <img
                  src={viewprofileimg}
                  alt="Profile"
                  className="profile_image"
                  width={100}
                  height={100}
                />
              ) : (
                <FaUserCircle size={120} color="#ccc" />
              )}
            </div>

            <div className="flex-grow-1 viewerSection">
              <h5 className="view_username">{userdata?.username || ""}</h5>
              <p className="View_usertype">{userdata?.usertype || ""}</p>
              <p className="View_userdata">{userdata?.address || ""}</p>
            </div>
          </div>
        </div>

        <div className="tabsec_Viewuser pt-2">
          <SearchBar placeholder="Search Zones..." onSearch={setQuery} />
          <div
            className="tab_div_Container"
            style={{ maxHeight: "400px", overflowY: "scroll" }}
          >
            <DataTable
              columns={columns}
              data={filteredZones}
              highlightOnHover
              pointerOnHover
              selectableRowsHighlight
              pagination
              paginationPerPage={5}
              paginationRowsPerPageOptions={[5, 10, 15]}
              responsive
              customStyles={customStyles}
            />
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ViewUser;
