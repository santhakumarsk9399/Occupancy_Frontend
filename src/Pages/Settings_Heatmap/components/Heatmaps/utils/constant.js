
// ─── Mock Data ───────────────────────────────────────────────────────────────
// export const MALLS = ["Nexus Mall - BLR", "Phoenix Mall - MUM", "Select City - DEL", "DLF Mall of India"];
// export const FLOORS = {
//     "Nexus Mall - BLR": ["Ground Floor", "First Floor", "Second Floor", "Fourth Floor"],
//     "Phoenix Mall - MUM": ["Ground Floor", "First Floor"],
//     "Select City - DEL": ["Ground Floor", "Level 1"],
//     "DLF Mall of India": ["Ground Floor", "Second Floor", "Third Floor"],
// };
// export const ZONES = {
//     "Ground Floor": ["Food Zone", "Retail Zone", "Entertainment Zone", "Electronics Zone"],
//     "First Floor": ["Fashion Zone", "Electronics Zone", "Supermarket Zone"],
//     "Second Floor": ["Food Court", "Multiplex", "Entertainment Zone"],
//     "Level 1": ["Zone A", "Zone B"],
//     "Fourth Floor": ["Retail Zone"],
//     "Third Floor": ["Supermarket Zone"],
// };

// export const MALLS = ["Nexus Mall - BLR", "Phoenix Mall - MUM", "Select City - DEL", "DLF Mall of India"];

// // Keyed by Mall → lists Zones
// export const ZONES = {
//     "Nexus Mall - BLR": ["Food Zone", "Retail Zone", "Entertainment Zone", "Electronics Zone", "Fashion Zone", "Food Court", "Multiplex", "Supermarket Zone"],
//     "Phoenix Mall - MUM": ["Food Zone", "Fashion Zone", "Electronics Zone"],
//     "Select City - DEL": ["Zone A", "Zone B"],
//     "DLF Mall of India": ["Food Court", "Supermarket Zone", "Retail Zone"],
// };

// // Keyed by Zone → lists Floors
// export const FLOORS = {
//     "Food Zone": ["Ground Floor"],
//     "Retail Zone": ["Ground Floor", "Fourth Floor"],
//     "Entertainment Zone": ["Ground Floor", "Second Floor"],
//     "Electronics Zone": ["Ground Floor", "First Floor"],
//     "Fashion Zone": ["First Floor"],
//     "Food Court": ["Second Floor", "Ground Floor"],
//     "Multiplex": ["Second Floor"],
//     "Supermarket Zone": ["First Floor", "Third Floor"],
//     "Zone A": ["Level 1"],
//     "Zone B": ["Level 1"],
// };

export const MALLS = [
    "Nexus Mall - BLR",
    "Phoenix Mall - MUM",
    "Select City - DEL",
    "DLF Mall of India",
];

export const FLOORS = {
    "Nexus Mall - BLR": [
        "Ground Floor",
        "First Floor",
        "Second Floor",
        "Third Floor",
        "Fourth Floor",
    ],

    "Phoenix Mall - MUM": [
        "Ground Floor",
        "First Floor",
    ],

    "Select City - DEL": [
        "Level 1",
    ],

    "DLF Mall of India": [
        "Ground Floor",
        "First Floor",
        "Second Floor",
    ],
};

export const ZONES = {
    "Ground Floor": [
        "Food Zone",
        "Retail Zone",
        "Electronics Zone",
    ],

    "First Floor": [
        "Fashion Zone",
        "Supermarket Zone",
    ],

    "Second Floor": [
        "Food Court",
        "Multiplex",
        "Entertainment Zone",
    ],

    "Third Floor": [
        "Supermarket Zone",
    ],

    "Fourth Floor": [
        "Retail Zone",
    ],

    "Level 1": [
        "Zone A",
        "Zone B",
    ],
  };

// ─── Zone gradient presets ────────────────────────────────────────────────────
export const ZONE_GRADIENTS = [
    { id: "blue", label: "Ocean Blue", fill: "rgba(59,130,246,0.22)", stroke: "#2563eb", gradient: ["#bfdbfe", "#3b82f6"] },
    { id: "green", label: "Forest Green", fill: "rgba(34,197,94,0.22)", stroke: "#16a34a", gradient: ["#bbf7d0", "#22c55e"] },
    { id: "purple", label: "Royal Purple", fill: "rgba(139,92,246,0.22)", stroke: "#7c3aed", gradient: ["#ede9fe", "#8b5cf6"] },
    { id: "orange", label: "Sunset Orange", fill: "rgba(249,115,22,0.22)", stroke: "#ea580c", gradient: ["#fed7aa", "#f97316"] },
    { id: "red", label: "Crimson Red", fill: "rgba(239,68,68,0.22)", stroke: "#dc2626", gradient: ["#fecaca", "#ef4444"] },
    { id: "teal", label: "Teal", fill: "rgba(20,184,166,0.22)", stroke: "#0d9488", gradient: ["#ccfbf1", "#14b8a6"] },
];

export const zoneColors = {
    blue: { fill: "rgba(59,130,246,0.22)", stroke: "#2563eb", gradient: ["#bfdbfe", "#3b82f6"] },
    green: { fill: "rgba(34,197,94,0.22)", stroke: "#16a34a", gradient: ["#bbf7d0", "#22c55e"] },
    red: { fill: "rgba(239,68,68,0.22)", stroke: "#dc2626", gradient: ["#fecaca", "#ef4444"] },
    orange: { fill: "rgba(249,115,22,0.22)", stroke: "#ea580c", gradient: ["#fed7aa", "#f97316"] },
    purple: { fill: "rgba(139,92,246,0.22)", stroke: "#7c3aed", gradient: ["#ede9fe", "#8b5cf6"] },
    teal: { fill: "rgba(20,184,166,0.22)", stroke: "#0d9488", gradient: ["#ccfbf1", "#14b8a6"] }
};
export const icons = {
    redo: "M21 7v6h-6M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7",
    undo: "M3 7v6h6M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13",
    zoomIn: "M11 8v6M8 11h6M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
    zoomOut: "M8 11h6M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
    lasso: "M4.5 12a7.5 7.5 0 1015 0 7.5 7.5 0 00-15 0zM4.5 12c0 3 3 5.5 7.5 5.5",
    undo2: "M9 14L4 9l5-5M4 9h11a5 5 0 010 10h-1",
    chevronDown: "M6 9l6 6 6-6",
    plus: "M12 5v14M5 12h14",
    close: "M18 6L6 18M6 6l12 12",
    eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
    edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
    trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
    search: "M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
    list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
    arrowLeft: "M19 12H5M12 19l-7-7 7-7",
    save: "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8",
};
