import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import { Modal } from "react-bootstrap";
import "../../Pages/Historical Analytics/HistoricalChart.css";
import SmoothTooltip from "../CommonComponents/ToolTip";
import NoData from "../CommonComponents/NoDataAvailable";
import ZoomInIcon1 from "../../Components/Assets/ZoomIn.svg";
import Icon from "../CommonComponents/icon";

const HistoricalAnalyticsChart = ({ data }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {data && data.length > 0 ? (
        <div className="analytics-container_chart">
          <div className="analytics-header">
            <h5>Historical Analytics</h5>

            <button className="enlarge-btn" onClick={() => setShowModal(true)}>
               <Icon img={ZoomInIcon1} Img_width="20px" Img_height="20px" />
            </button>

          </div>

          {/* Normal Chart */}
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={410}>
              <BarChart
                className="custom-bar-chart"
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="ZoneName"
                  height={80}
                  tick={{ fontSize: 12 }}
                  label={{
                    value: "ZONES",
                    position: "insideBottom",
                    offset: 30,
                    fontSize: 14,
                  }}
                />
                <YAxis
                  label={{
                    value: "COUNTS",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10, // ⬅️ Add some offset
                    dx: -20, // ⬅️ Move text away from ticks
                    style: { fontSize: 14 },
                  }}
                />
                <Tooltip content={<SmoothTooltip />} cursor={false} />
                <Bar
                  dataKey="Counts"
                  fill="#25B27A"
                  radius={[4, 4, 0, 0]}
                  barSize={70}
                  isAnimationActive={false}
                >
                  <LabelList
                    dataKey="Counts"
                    position="top"
                    fill="black"
                    fontSize={14}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <Modal
            show={showModal}
            onHide={() => setShowModal(false)}
            size="xl"
            centered
            dialogClassName="enlarge-modal"
            className="historical-modal"
          >
            <Modal.Header closeButton>
              <Modal.Title>Historical Analytics </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {/* 🔹 Use enlarge wrapper here */}
              <div className="enlarge-chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    className="custom-bar-chart"
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e7eb"
                    />
                    <XAxis
                      dataKey="ZoneName"
                      height={80}
                      tick={{ fontSize: 12 }}
                      label={{
                        value: "ZONES",
                        position: "insideBottom",
                        offset: 30,
                        fontSize: 14,
                      }}
                    />
                    <YAxis
                      label={{
                        value: "COUNTS",
                        angle: -90,
                        position: "insideLeft",
                        offset: 10,
                        dx: -15,
                        style: { fontSize: 14 },
                      }}
                    />
                    <Tooltip content={<SmoothTooltip />} cursor={false} />
                    <Bar
                      dataKey="Counts"
                      fill="#25B27A"
                      radius={[4, 4, 0, 0]}
                      barSize={70}
                      isAnimationActive={false}
                    >
                      <LabelList
                        dataKey="Counts"
                        position="top"
                        fill="black"
                        fontSize={14}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Modal.Body>
          </Modal>
        </div>
      ) : (
        <NoData name="no-data-Historical_dashboard" />
      )}
    </>
  );
};

export default HistoricalAnalyticsChart;


