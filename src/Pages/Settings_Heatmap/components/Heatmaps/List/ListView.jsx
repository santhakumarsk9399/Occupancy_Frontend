import { useState, useEffect } from "react";
import Icon from "../common/Icon";
import Table from "./Table";
import ViewPage from "./ViewPage";
import DeleteModal from "../List/DeleteModal"
import { icons } from "../utils/constant";
import "../Styles/list.css";
import "../Styles/pagination.css";

function ListView({ records = [], onAdd, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null); 
  console.log(records)
  const filtered = (records || []).filter(
    (r) =>
      r.ZoneName?.toLowerCase().includes(search.toLowerCase()) ||
      r.FloorName?.toLowerCase().includes(search.toLowerCase()) ||
      r.MallName?.toLowerCase().includes(search.toLowerCase())
  );

;

  const selectedRecord = records.find((r) => r.HeatMapID === selected);
  const handleRowClick = (r) => setSelected((s) => (s === r.HeatMapID ? null : r.HeatMapID));
// console.log(handleRowClick)
  // ── Confirm delete ──
  const handleDeleteConfirm = (id) => { 
    console.log(id)
    onDelete(id);
    setDeleteRecord(null);
    setSelected(null);
  };

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  // const recordsPerPage = 8
  const totalPages = Math.ceil(
    filtered.length / recordsPerPage
  );

  const startIndex =
    (currentPage - 1) * recordsPerPage;

  const paginatedRecords = filtered.slice(
    startIndex,
    startIndex + recordsPerPage
  );
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);
  // ── If viewing, show full-page view instead ──

  if (viewRecord) {
    return (
      <ViewPage
        viewRecord={viewRecord}
        onBack={() => setViewRecord(null)}
      />
    );
  }

  return (
    <div className="list-root">
      <div className="list-tabs">
        <button className="list-tab-active">Zone Image List</button>
      </div>
      <div className="list-card">
        {/* Toolbar */}
        <div className="list-toolbar">
          <div className="list-search-wrap">
            <input
              className="list-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
            />
            <div className="list-search-icon">
              <Icon d={icons.search} size={15} />
            </div>
          </div>

          <div className="list-toolbar-actions">
            <button
              onClick={() => selected && setViewRecord(selectedRecord)}
              disabled={!selected}
              className={`btn-view ${selected ? "btn-view--active" : "btn-view--disabled"}`}
            >
              <Icon d={icons.eye} size={14} />
              View Zone Image
            </button>

            <button
              onClick={() => selected && onEdit(selectedRecord)}
              disabled={!selected}
              className={`btn-edit-row ${selected ? "btn-edit-row--active" : "btn-edit-row--disabled"}`}
            >
              <Icon d={icons.edit} size={14} />
              Edit Zone Image
            </button>

            <button
              onClick={() => selected && setDeleteRecord(selectedRecord)}
              disabled={!selected}
              className={`btn-delete-row ${selected ? "btn-delete-row--active" : "btn-delete-row--disabled"}`}
            >
              <Icon d={icons.trash} size={14} />
              Delete Zone Image
            </button>
            <button onClick={onAdd} className="btn-add">
              <Icon d={icons.plus} size={14} strokeWidth={2.5} />
              Add Zone Image
            </button>
          </div>
        </div>

        {/* Table */}
        <Table
          records={paginatedRecords}
          selected={selected}
          onRowClick={handleRowClick}
          startIndex={startIndex}
        />
        <div className="table-footer">
          <div className="rows-per-page">
            <span>Rows per page:</span>

            <select
              value={recordsPerPage}
              onChange={(e) => {
                setRecordsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>

          <div>
            {startIndex + 1}-
            {Math.min(
              startIndex + recordsPerPage,
              filtered.length
            )} of {filtered.length}
          </div>
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              ‹
            </button>

            {Array.from(
              { length: totalPages },
              (_, i) => (
                <button
                  key={i + 1}
                  className={
                    currentPage === i + 1
                      ? "active-page"
                      : ""
                  }
                  onClick={() =>
                    setCurrentPage(i + 1)
                  }
                >
                  {i + 1}
                </button>
              )
            )}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              ›
            </button>
          </div>
        )}
        
        {deleteRecord && (
          <DeleteModal
            record={deleteRecord}
            onCancel={() => setDeleteRecord(null)}
            onConfirm={handleDeleteConfirm}
          />
        )}
      </div>
    </div>
  );
}

export default ListView;