import React from "react";
import "./EmailTab.css";

const EmailTabButtons = ({ activeTab, setActiveTab }) => (
  <div className="tab-buttons">
    <button
      className={activeTab === "email" ? "tab active" : "tab"}
      onClick={() => setActiveTab("email")}
    >
      SMTP
    </button>
    <button
      className={activeTab === "group" ? "tab active" : "tab"}
      onClick={() => setActiveTab("group")}
    >
      Email Group
    </button>
  </div>
);

export default EmailTabButtons;