import React from "react";
import "../../Components/Styles/SelectedZones.css"
import { AlertCircle } from "lucide-react"; 

const SelectZones = ({name, data}) => {
  return (
    <div className={name}>
      {/* <AlertCircle className="no-data-icon" /> */}
          <p className="no-data-text">{data}</p>
    </div>
  );
};

export default SelectZones;