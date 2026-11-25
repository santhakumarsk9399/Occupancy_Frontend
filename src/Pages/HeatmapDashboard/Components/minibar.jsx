import "../Styles/minibars.css"
const MiniBarChart = ({ color = "#7C3AED" }) => {
    // const bars = [18, 28, 45, 58, 72, 60, 50, 42, 30, 18];
    const bars = [10, 16, 24, 32, 40, 34, 28, 22, 16, 10];
    return (
        <div className="mini-bars-chart">
            {bars.map((h, i) => (
                <div
                    key={i}
                    className="bar"
                    style={{
                        height: `${h}px`,
                        background: color
                    }}
                />
            ))}
        </div>
    );
};

export default MiniBarChart;