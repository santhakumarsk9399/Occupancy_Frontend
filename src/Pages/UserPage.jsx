// UserPage.js
import React, { useState, useEffect, useRef } from "react";
import { Tab, Nav, Table, Button, Form } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import "../Components/Styles/UsersPage.css";
import DataTable from "react-data-table-component";
import SearchBar from "./CommonComponents/SearchBar";
import Buttons from "./CommonComponents/Button";
import { FaSave, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import AddUserModal from "../Pages/Users/AddUserModel";
import UserFormModal from "../Pages/Users/AddUser";
import DeleteUserModal from "./Users/DeleteUserModal";
import ViewUser from "./Users/ViewUser";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RxFontFamily } from "react-icons/rx";
import userprofileimage from "../Components/Assets/users/userprofile_1.png";
import Loader from "./CommonComponents/Loader";

// import { FaPlus } from 'react-icons/fa';  // Font Awesome icon

const UserPage = () => {
  const [showModal, setShowModal] = useState(false); // add popup modal
  const [showDeleteModal, setShowDeleteModal] = useState(false); // delete popup modal
  const [showView, setShowView] = useState(false); // View popup modal
  const [query, setQuery] = React.useState(""); // search option
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null); // Selected Row
  const [users, setUsers] = useState(null); // add user
  const [editUser, seteditUser] = useState(null); // edit user
  const [userZones, setUserSelectedZones] = useState(null); // edit user
  const [selectedUser, setSelectedUser] = useState({}); // selected user
  const [zoneOptions, setZoneOptions] = useState([]); // selected for mainuser
  const [getUserProfile, setUserProfile] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL; // API main url
  const tableWrapperRef = useRef(null); // div wrapper
  const hasFetchedRef = useRef(false); // API  cals only once
  const token = sessionStorage.getItem("token"); // token
  const vid = sessionStorage.getItem("vid"); // vendor id
  const MainUsername = sessionStorage.getItem("username"); // username
  const [isLoading, setIsLoading] = useState(false);
  // ----------------- Detect click outside table and reset selected row-----------------------------
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // -----------------Highlight selected row background color-------------------------------------------
  const conditionalRowStyles = [
    {
      when: (row) => row.sl === selectedRowId,
      style: {
        backgroundColor: "#f6f7fc",
      },
    },
  ];
  //-------------------------Get the All sub users based on main user-----------------------------------------------------
  const fetchUsers = async () => {
    setIsLoading(true); // start loader
    try {
      const payload = {
        vid,
        username: MainUsername,
      };
      const [userRes, zoneRes, profiledata] = await Promise.all([
        axios.post(`${API_URL}/settings/users/subusers`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.post(`${API_URL}/settings/users/allzones`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.post(`${API_URL}/settings/users/userProfile`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);
      // console.log(zoneRes , profiledata);
      const formatted = zoneRes.data?.allZones.map((zone) => ({
        label: zone.zonename, 
        value: zone.sl,
      }));
      setUserProfile(profiledata.data);
      setZoneOptions(formatted);
      setUsers(userRes.data?.users); //
      // setLoading(false);
    } catch (err) {
      // setError("Failed to load users");
      // setLoading(false);
      console.log(err);
    } finally {
      setIsLoading(false); // stop loader
    }
  };
  const profilepayload = {
    vid,
    username: MainUsername,
  };
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchUsers();
    GetUserProfile(profilepayload);
  }, []);

  // ------------------------GetUSerProfile---------------------------------------------------------------

  const GetUserProfile = async (userdata) => {
    // setSelectedUser(null)
    try {
      let response = await axios.post(
        `${API_URL}/settings/users/userProfile`,
        userdata,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(response.data);
      seteditUser(response.data?.user[0]);
      setUserSelectedZones(response.data);
      // console.log("selecteduserzones",response.data)
      setSelectedUser(response.data);
      // console.log(response.data?.user);
    } catch (error) {
      console.log(error);
    }
  };
  //-------------------Handling user methods -------------------------------------------------------------

  const handleAddUser = () => {
    seteditUser(null);
    setUserSelectedZones(null);
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleViewUser = () => {
    setSelectedUser(null);
    let Viewuser =
      users != null
        ? users.filter((user) => user.sl === selectedRowId)
        : selectedRowId;
    const getpayload = {
      vid,
      username: Viewuser[0].username,
    };
    GetUserProfile(getpayload);
    setShowView(true);
  };

  const handleEditClick = () => {
    let Viewuser =
      users != null
        ? users.filter((user) => user.sl === selectedRowId)
        : selectedRowId;
    const getpayload = {
      vid,
      username: Viewuser[0].username,
    };
    GetUserProfile(getpayload);
    setShowModal(true);
  };

  const PostData = async (payload1) => {
    try {
      let response = await axios.post(
        `${API_URL}/settings/users/createOrUpdateUser`,
        payload1,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);
      fetchUsers();
    } catch (error) {
      console.log(error);
    }
  };
  //----------------------- Handling Add user ----------------------------------------------------------------
  const handleAddOrUpdate = async (formData) => {
    // console.log(formData);
    const payload = {
      username: formData?.username,
      mainusername: MainUsername,
      password: formData?.password,
      useremailid: formData?.useremailid,
      usertype: formData?.usertype,
      useraddress: formData?.useraddress,
      healthmail: formData?.receiveHealthMail,
      userblock: formData?.userblock,
      zonename: formData?.selectedZones.map((zone) => zone.label).join(","),
      selected: editUser ? "Update" : "Insert",
    };
    if (editUser) {
      // console.log(formData)
      PostData(payload);
      seteditUser(null);
      setShowModal(false);
    } else {
      PostData(payload);
      setShowModal(false);
      toast("User Added Successfully!!!", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  //-------------------------Handling Delete user --------------------------------------------------------------
  const handleDeleteUser = async () => {
    let deleteUser =
      users != null
        ? users.filter((user) => user.sl === selectedRowId)
        : selectedRowId;
    const [vuser] = deleteUser;
    console.log(vuser);
    setSelectedUser(vuser);
    setShowDeleteModal(true);
  };
  const handleDelete = async (data) => {
    let message = data?.data?.message;
    toast(message, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
    fetchUsers();
  };
  //---------------- Table Header fixed --------------------------------------------------------------------------
  const Template = (args) => <FixedHeaderStory {...args} />;

  const FixedHeader = Template.bind({});

  FixedHeader.args = {
    fixedHeader: true,
    fixedHeaderScrollHeight: "300px",
  };
  //-------------------------------------------Columns------------------------------------------
  const columns = [
    {
      name: "SL",
      selector: (row) => row.sl,
      width: "100px",
    },
    {
      name: "USER NAME",
      selector: (row) => row.username,
    },
    {
      name: "USER TYPE",
      selector: (row) => row.usertype,
    },
    {
      name: "EMAIL",
      selector: (row) => row.useremailid,
    },
  ];
  //----------------------------------------------columns for zones---------------------------------

  const Zonecolumns = [
    {
      name: "SL",
      selector: (row) => row.sl,
      width: "100px",
    },
    {
      name: "ZONE NAME",
      selector: (row) => row.zonename,
    },
  ];

  //---------------------filter the users for search option-----------------------------------------
  const filteredProducts =
    users != null
      ? users.filter(
          (users) =>
            users.username &&
            users.username.toLowerCase().includes(query.toLocaleLowerCase())
          // ||
          // (data.year && data.year.toLowerCase().includes(filterText.toLocaleLowerCase()))
        )
      : "";
  const filteredZones = Array.isArray(getUserProfile?.allZones)
    ? getUserProfile.allZones.filter((zones) =>
        zones.zonename?.toLowerCase().includes(query.toLocaleLowerCase())
      )
    : [];

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
        minHeight: "48px", // row height
        "&:hover": {
          backgroundColor: "#f0f9ff", // hover background
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
      {isLoading && <Loader />}
      <div className="Usercontainer">
        <ToastContainer />
        <div className="d-flex p-3 rounded profilesec">
          <div className="me-3 imageSec">
            {userprofileimage ? (
              <img
                src={userprofileimage}
                alt="Profile"
                className="profile_image"
                width={140}
                height={140}
              />
            ) : (
              ""
            )}
          </div>
          {getUserProfile?.user && getUserProfile.user.length > 0 ? (
            <>
              <div className="flex-grow-1 usersection_profile">
                <h5 className="user_username">
                  {getUserProfile.user[0].username}
                </h5>
                <p className="user_usertype">
                  {getUserProfile.user[0].usertype}
                </p>
                <p className="user_useraddress">
                  {getUserProfile.user[0].useraddress}
                </p>
                <Button variant="primary" size="sm">
                  Edit Profile
                </Button>
              </div>
            </>
          ) : (
            <p>Loading user profile...</p>
          )}
        </div>
        <div className="tabsec">
          <Tab.Container defaultActiveKey="users">
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="users">All User(s)</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="zones">All Zone(s)</Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content className="bg-white border p-3">
              <Tab.Pane eventKey="zones">
                <div className="UserTable_TopSection" ref={tableWrapperRef}>
                  {/* <h1>All Users</h1> */}
                  <div className="UserTable_Section">
                    <div className="searchandBtSection">
                      <div className="searchbarsec">
                        <SearchBar
                          placeholder="Search Zones..."
                          onSearch={setQuery}
                        />
                      </div>
                    </div>
                    <div style={{ maxHeight: "400px", overflowY: "scroll" }}>
                      <DataTable
                        columns={Zonecolumns}
                        data={filteredZones}
                        // onRowClicked={(row) => setSelectedRowId(row.sl)}
                        highlightOnHover
                        pointerOnHover
                        selectableRowsHighlight
                        conditionalRowStyles={conditionalRowStyles}
                        pagination
                        paginationPerPage={5}
                        paginationRowsPerPageOptions={[5, 10, 15]}
                        responsive
                        customStyles={customStyles}
                      />
                    </div>
                  </div>
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="users">
                <div className="UserTable_TopSection" ref={tableWrapperRef}>
                  {/* <h1>All Users</h1> */}
                  <div className="UserTable_Section">
                    <div className="searchandBtSection">
                      <div className="searchbarsec">
                        <SearchBar
                          placeholder="Search Users..."
                          onSearch={setQuery}
                        />
                      </div>
                      <div className="buttonsSections">
                        <div className="p-4">
                          <Buttons
                            text="View"
                            type="button"
                            size="md"
                            variant="primary"
                            onClick={handleViewUser}
                            icon={<FaPlus />}
                            disabled={!selectedRowId}
                          />{" "}
                          <Buttons
                            text="Edit"
                            type="button"
                            size="md"
                            variant="primary"
                            onClick={handleEditClick}
                            icon={<FaPlus />}
                            disabled={!selectedRowId}
                          />{" "}
                          <Buttons
                            text="Delete"
                            type="button"
                            size="md"
                            variant="primary"
                            onClick={handleDeleteUser}
                            icon={<FaPlus />}
                            disabled={!selectedRowId}
                          />{" "}
                          <Buttons
                            text="Add User"
                            type="button"
                            size="md"
                            variant="primary"
                            onClick={handleAddUser}
                            icon={<FaPlus />}
                          />{" "}
                          <UserFormModal
                            show={showModal}
                            handleClose={() => setShowModal(false)}
                            onSave={handleAddOrUpdate}
                            editingUser={editUser}
                            Zones={zoneOptions}
                            userdata={userZones}
                          />
                          <DeleteUserModal
                            show={showDeleteModal}
                            onClose={() => setShowDeleteModal(false)}
                            user={selectedUser}
                            onDelete={handleDelete}
                          />
                          <ViewUser
                            show={showView}
                            handleClose={() => setShowView(false)}
                            user={selectedUser}
                          />
                        </div>
                      </div>
                    </div>
                    <div style={{ maxHeight: "400px", overflowY: "scroll" }}>
                      {/* const FixedHeaderStory = ({ fixedHeader, fixedHeaderScrollHeight }) => ( */}
                      <DataTable
                        columns={columns}
                        data={filteredProducts}
                        onRowClicked={(row) => setSelectedRowId(row.sl)}
                        highlightOnHover
                        pointerOnHover
                        selectableRowsHighlight
                        conditionalRowStyles={conditionalRowStyles}
                        pagination
                        paginationPerPage={5}
                        paginationRowsPerPageOptions={[5, 10, 15]}
                        responsive
                        fixedHeader={FixedHeader}
                        fixedHeaderScrollHeight={
                          FixedHeader.fixedHeaderScrollHeight
                        }
                        customStyles={customStyles}
                      />
                    </div>
                  </div>
                </div>
                {/* <p>Camera data section (you can customize this).</p> */}
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </div>
      </div>
    </>
  );
};
export default UserPage;
