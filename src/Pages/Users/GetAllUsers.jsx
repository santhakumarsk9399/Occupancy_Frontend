import React, { useState } from "react";
import DataTable from "react-data-table-component";
import "../../Components/Styles/Table.css";
import "../../Components/Styles/UsersPage.css";
import SearchBar from "../CommonComponents/SearchBar";
import Button from "../CommonComponents/Button";
import { FaSave, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import AddUserModal from "./AddUser";
import LoginForm from "./AddUser";

const GetAllUsersList = () => {
  const [query, setQuery] = React.useState("");
  const [showModal, setShowModal] = useState(false);
  const columns = [
    {
      name: "Title",
      selector: (row) => row.title,
    },
    {
      name: "Role",
      selector: (row) => row.role,
    },
    {
      name: "Year",
      selector: (row) => row.year,
    },
  ];

  const data = [
    {
      id: 1,
      title: "venky",
      role: "Tester",
      year: "1988",
    },
    {
      id: 2,
      title: "santha",
      role: "FrontendDeveloper",
      year: "1984",
    },
    {
      id: 3,
      title: "siva",
      role: "BackendDeveloper",
      year: "1988",
    },
    {
      id: 4,
      title: "ragav",
      role: "FrontendDeveloper",
      year: "1984",
    },
  ];

  const filteredProducts =
    data != null
      ? data.filter(
          (data) =>
            data.title &&
            data.title.toLowerCase().includes(query.toLocaleLowerCase())
          // ||
          // (data.year && data.year.toLowerCase().includes(filterText.toLocaleLowerCase()))
        )
      : "";

  const handleAddUser = (userData) => {
    console.log("User Data Submitted:", userData);
    // You can send this data to an API or update state
  };
  return (
    <>
      <div className="UserTable_TopSection">
        <h1>All Users</h1>
        <div className="UserTable_Section">
          <div className="searchandBtSection">
            <div className="searchbarsec">
              <SearchBar placeholder="Search Users..." onSearch={setQuery} />
            </div>
            <div className="buttonsSections">
              <div className="p-4">
                <Button icon={FaSave} onClick={() => alert("Saved!")}>
                  Save
                </Button>{" "}
                <Button
                  icon={FaEdit}
                  variant="warning"
                  onClick={() => alert("Editing")}
                >
                  Edit
                </Button>{" "}
                <Button
                  icon={FaTrash}
                  variant="danger"
                  iconPosition="right"
                  onClick={() => alert("Deleted")}
                >
                  Delete
                </Button>{" "}
                <Button
                  icon={FaPlus}
                  variant="success"
                  size="lg"
                  onClick={() => setShowModal(true)}
                >
                  Add User
                </Button>
                {/* <AddUserModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleSave={handleAddUser}
      /> */}
                <LoginForm
                  show={showModal}
                  handleClose={() => setShowModal(false)}
                  handleSave={handleAddUser}
                />
              </div>
            </div>
          </div>
          <DataTable columns={columns} data={filteredProducts} selectableRows />
        </div>
      </div>
    </>
  );
};

export default GetAllUsersList;
