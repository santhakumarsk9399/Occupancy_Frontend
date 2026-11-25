import React, { useRef, useEffect } from "react";
import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Filler,
    Tooltip,
} from "chart.js";

Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Filler,
    Tooltip
);

export default function CanvasChart({ hourly }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        if (chartRef.current) chartRef.current.destroy();

        const ctx = canvasRef.current.getContext("2d");

        // Gradient matches your Recharts area
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, "rgba(29, 78, 216, 0.18)");
        gradient.addColorStop(1, "rgba(29, 78, 216, 0)");

        chartRef.current = new Chart(ctx, {
            type: "line",
            data: {
                labels: hourly.map((d) => d.Hours),
                datasets: [
                    {
                        label: "Live Occupancy",
                        data: hourly.map((d) => d.LiveOccupancy),
                        borderColor: "#1d4ed8",
                        backgroundColor: gradient,
                        borderWidth: 3,
                        tension: 0.35,
                        fill: true,
                        pointRadius: 0,
                        pointHitRadius: 10,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: { display: false },

                    tooltip: {
                        backgroundColor: "#fff",
                        borderColor: "#d1d5db",
                        borderWidth: 1,
                        titleColor: "#111",
                        bodyColor: "#111",
                        padding: 10,

                        callbacks: {
                            title: (items) => `Hour: ${items[0].label}`,
                            label: (item) => `Live Occupancy: ${item.raw}`,
                        },
                    },
                },

                scales: {
                    x: {
                        ticks: {
                            color: "#4b5563",
                            font: { size: 12 },
                            maxRotation: 45,
                            minRotation: 45,
                            callback: function (value, index) {
                                const hour = this.getLabelForValue(index);
                                const [h, m] = hour.split(":");
                                return m === "00" ? `${h}:00` : "";
                            },
                        },
                        title: {
                            display: true,
                            text: "HOURS",
                            color: "#4b5563",
                            font: { size: 13, weight: "600" },
                        },
                        grid: { display: false },
                    },

                    y: {
						 beginAtZero: true,
                          min: 0,           
                        ticks: {
                            color: "#4b5563",
                            font: { size: 12 },
                        },
                        title: {
                            display: true,
                            text: "COUNTS",
                            color: "#4b5563",
                            font: { size: 13, weight: "600" },
                        },
                        grid: { color: "#e5e7eb" },
                    },
                },
            },
        });

        return () => chartRef.current?.destroy();
    }, [hourly]);

    return <canvas ref={canvasRef} style={{ width: "100%", height: "390px" }} />;
}
