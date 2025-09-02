import React from "react";
import "../../Components/Styles/Header.css";
import { Button } from "react-bootstrap";
import "../../Components/Styles/CustomButtons.css"
import Filtericon from "../../Components/Assets/dashboard/filterIcon.svg";
import Icon from "./icon";

const DashHeader = ({ title ,onFilterClick }) => {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center Dash_header">
        <div className="headerLabel">
          <header className="headersec">
            <h3 className="Dashheader_title">{title}</h3>
          </header>
        </div>
        <div className="filterSection">
          <Button
            className="custom-close-button filtersbtn"
            variant="secondary"
            onClick={onFilterClick}
          >
            <Icon img={Filtericon} Img_width="20px" Img_height="20px" className="btn-icon"/>
            Filters
          </Button>
        </div>
      </div>
    </>
  );
};

export default DashHeader;
