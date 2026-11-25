// import "../Styles/visitorsprogress.css"
// const VisitorsProgress = ({
//     value = 18,
//     color = "#22C55E"
// }) => {

//     return (

//         <div className="inside-progress">

//             <div
//                 className="inside-fill"
//                 style={{
//                     width: `${value}%`,
//                     background: color
//                 }}
//             />

//         </div>

//     );
// };

// export default VisitorsProgress;

import "../Styles/visitorsprogress.css";

const VisitorsProgress = ({ value, total, percentage }) => {
    return (
        <div className="inside-progress">

            <div className="inside-bar">

                <div
                    className="inside-thumb-wrapper"
                    style={{ left: `${percentage}%` }}
                >
                    <span className="inside-value">{value}</span>
                    <span className="inside-thumb"></span>
                </div>

            </div>

            <div className="inside-scale">
                <span>0</span>
                <span>{total}</span>
            </div>

        </div>
    );
};

export default VisitorsProgress;