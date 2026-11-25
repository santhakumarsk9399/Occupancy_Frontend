import React, { useMemo, useState, useEffect } from "react";
import { Modal, Tab, Nav } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import "./ServiceAreaModal.css";

const normalizeList = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === "string") {
    // Support CSV strings
    return val
      .split(/\n|,/) 
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

const ServiceAreaList = ({ title, items }) => {
  return (
    <div className="sa-list">
      <div className="sa-list-head">{title}</div>
      <div className="sa-list-body">
        {items.length === 0 ? (
          <div className="sa-empty">No items found</div>
        ) : (
          items.map((it, idx) => (
            <div key={idx} className="sa-row">
              {it}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ServiceAreaModal = ({
  show,
  onClose,
  zone = null,
  zoneName = "",
  entryList = [],
  exitList = [],
}) => {
  // Prefer the full zone object if provided
  const effectiveZoneName = zone?.zoneName || zoneName || "";
  const effectiveEntry = zone?.serviceAreaEntry ?? entryList;
  const effectiveExit = zone?.serviceAreaExit ?? exitList;
  const [active, setActive] = useState("entry");
  const [q, setQ] = useState("");
  // Always default to Entry tab on open
  useEffect(() => {
    if (show) {
      setActive("entry");
      setQ("");
    }
  }, [show]);

  const rawEntry = useMemo(() => normalizeList(effectiveEntry), [effectiveEntry]);
  const rawExit = useMemo(() => normalizeList(effectiveExit), [effectiveExit]);

  const filteredEntry = useMemo(
    () => rawEntry.filter((s) => s.toLowerCase().includes(q.toLowerCase())),
    [rawEntry, q]
  );
  const filteredExit = useMemo(
    () => rawExit.filter((s) => s.toLowerCase().includes(q.toLowerCase())),
    [rawExit, q]
  );

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static" size="lg">
      <div className="sa-modal">
        <div className="sa-header">
          <div className="sa-zone">Zone Name: <strong>{effectiveZoneName}</strong></div>
          <button className="sa-close" aria-label="Close" onClick={onClose}>×</button>
        </div>

        <div className="sa-tabs">
          <Tab.Container activeKey={active} onSelect={(k) => { setQ(""); setActive(k || "entry"); }}>
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="entry">Service Area Entry</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="exit">Service Area Exit</Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content className="sa-content">
              <Tab.Pane eventKey="entry">
                <div className="sa-topline">
                  <div className="sa-section-title">Service Area Entry</div>
                  <div className="sa-count">Total Number of Service Area Entry Configured: {rawEntry.length}</div>
                </div>
                <div className="sa-search">
                  <FaSearch className="sa-search-icon" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
                <ServiceAreaList title="SERVICE AREA ENTRY" items={filteredEntry} />
              </Tab.Pane>
              <Tab.Pane eventKey="exit">
                <div className="sa-topline">
                  <div className="sa-section-title">Service Area Exit</div>
                  <div className="sa-count">Total Number of Service Area Exit Configured: {rawExit.length}</div>
                </div>
                <div className="sa-search">
                  <FaSearch className="sa-search-icon" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
                <ServiceAreaList title="SERVICE AREA EXIT" items={filteredExit} />
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </div>
      </div>
    </Modal>
  );
};

export default ServiceAreaModal;
