import React from "react";
import SummaryCards from "../components/SummaryCards";
import MallSection from "../components/MallSection";
import { mallsData } from "../data/mockData";
import "../Styles/liveTab.css"
const LiveTab = () => {
  return (
    <div>
      <SummaryCards />

      {/* Common Header */}
      <div className="mall-container">
      <div className="mall-header">
        <h4 className="mall-title">Malls</h4>

        <div className="occupancy-wrapper">
          <span className="occupancy-label">Occupancy</span>

          <div className="gradient-bar"></div>

          <div className="range">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    
      {/* Mall List */}
      {mallsData.map((mall, index) => (
        <MallSection key={index} mall={mall} />
      ))}
        
      </div>
    </div>
  );
};

export default LiveTab;