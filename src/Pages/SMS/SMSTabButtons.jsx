import React from "react";
import "./EmailTab.css";

const SMSTabButtons = ({ activeTab, setActiveTab }) => (
  <div className="tab-buttons">
    <button
      className={activeTab === "sms" ? "tab active" : "tab"}
      onClick={() => setActiveTab("sms")}
    >
      SMS
    </button>
    <button
      className={activeTab === "group" ? "tab active" : "tab"}
      onClick={() => setActiveTab("group")}
    >
      SMS Group
    </button>
  </div>
);

export default SMSTabButtons;
