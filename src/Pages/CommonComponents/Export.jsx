import React, { useState, useRef, useEffect } from "react";
import { downloadExcel } from "../CommonComponents/DownloadExcel";
import { downloadPDF } from "../CommonComponents/DownloadPdf";
import excelImage from "../../Components/Assets/web.png";
import pdfImage from "../../Components/Assets/pdf.png";
import Icon from "./icon";
import Download from "../../Components/Assets/download.png";
import '../../Components/Styles/Export.css'

const ExportDropdown = ({ data, date }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  let username = sessionStorage.getItem("username");
  useEffect(() => {
    const handler = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  let FileName = ("HistoricalData" + "_" + date) || "HistoricalData";
  return (
    <div className="position-relative" ref={dropdownRef}>
      <button className="apply-btn d-flex align-items-center gap-0" onClick={() => setOpen(!open)}>
        {/* <button className="btn btn-primary d-flex align-items-center gap-0" onClick={() => setOpen(!open)}> */}
        {/* <Icon
          img={Download}
          Img_width="20px"
          Img_height="20px"
          className="btn-icon"
        /> */}
        <span className="exportoptionLabel">Download</span>
      </button>

      {open && (
        <div
          className="shadow p-2 bg-white rounded border mt-2"
          style={{
            position: "absolute",
            right: 0,
            width: "150px",
            zIndex: 999,
          }}
        >
          <button
            className="dropdown-item d-flex align-items-center"
            onClick={() => {
              downloadExcel(data, FileName, "Historical Data", { dateRange: date, user: username || "" });
              setOpen(false);
            }}
          >
            <Icon
              img={excelImage}
              Img_width="20px"
              Img_height="20px"
              className="btn-icon"
            />
            <span className="exportoptionLabel">Excel</span>
          </button>

          <button
            className="dropdown-item d-flex align-items-center"
            onClick={() => {
              downloadPDF(data, FileName, { reportName: "Historical Data", dateRange: date, user: username });
              setOpen(false);
            }}
          >
            {" "}
            <Icon
              img={pdfImage}
              Img_width="20px"
              Img_height="20px"
              className="btn-icon"
            />
            <span className="exportoptionLabel">Pdf</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;
