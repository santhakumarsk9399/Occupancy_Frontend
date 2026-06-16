import Icon from "../common/Icon";
import { icons } from "../utils/constant";
import "../Styles/list.css";
import { getImageUrl } from "../utils/imageHelper";
// ─── Table ────────────────────────────────────────────────────────────────────
function Table({ records, selected, onRowClick, startIndex }) {
  return (
    <div className="list-table-wrap">
      <div className="list-table-container">
        <table className="list-table">
          <thead>
            <tr>
              {["SL", "ZONE IMAGE", "ZONE NAME", "FLOOR NAME", "MALL NAME"].map(
                (h) => (
                  <th key={h}>{h}</th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={5} className="list-table-empty">
                  No zone images found. Click "+ Add Zone Image" 
                </td>
              </tr>
            ) : (
              records.map((r, i) => (
                <tr
                  key={r.HeatMapID}
                  onClick={() => onRowClick(r)}
                  style={{
                    background:
                      selected === r.HeatMapID
                        ? "#eff6ff"
                        : i % 2 === 0
                          ? "white"
                          : "#fafafa",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (selected !== r.HeatMapID)
                      e.currentTarget.style.background = "#f9fafb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      selected === r.HeatMapID
                        ? "#eff6ff"
                        : i % 2 === 0
                          ? "white"
                          : "#fafafa";
                  }}
                >
                  {/* <td style={{ color: "#374151" }}>{i + 1}</td> */}
                  <td style={{ color: "#374151" }}>{startIndex + i + 1}</td>
                  <td>
                    {r.ThumbnailURL || r.FullImageURL ? (
                      <img
                        src={getImageUrl(
                          r.ThumbnailURL || r.FullImageURL
                        )}
                        alt="zone"
                        className="list-crop-thumb"
                        onError={(e) => {
                          console.log(
                            "Image Load Error:",
                            r.ThumbnailURL || r.FullImageURL
                          );
                        }}
                    />
                    ) : (
                      <div className="list-crop-placeholder">
                        <Icon d={icons.lasso} size={16} />
                      </div>
                    )}
                  </td>
                  <td
                    // style={{ color: "#111827", fontWeight: 500 }}
                  >
                    {r.ZoneName}
                  </td>
                  <td style={{ color: "#374151" }}>{r.FloorName}</td>
                  <td style={{ color: "#374151" }}>{r.MallName}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
