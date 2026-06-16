// import { useState, useEffect } from "react";
// import ListView from "./List/ListView";
// import EditorView from "./Editor/EditorView";
// import { getZones, createZone, updateZone, deleteZone } from "../../Api/zoneImagesApis";
// import { showError, showSuccess } from "./common/Toaster";

// // ─── Heatmap Root ─────────────────────────────────────────────────────────────
// export default function HeatMap() {
//     const [view, setView] = useState("list"); // "list" | "add" | "edit"
//     const [records, setRecords] = useState([]);
//     const [editRecord, setEditRecord] = useState(null);

//     useEffect(() => {
//         loadZones();
//     }, []);

//     // ── Data helpers ──
//     const loadZones = async () => {
//         const data = await getZones();
//         // Normalize _id → id so the UI works uniformly
//         const normalized = data.map((r) => ({ ...r, id: r._id }));
//         setRecords(normalized);
//     };

//     const handleSave = async (record) => {
//         try {
//             if (record._id) {
//                 await updateZone(record._id, record);
//             } else {
//                 await createZone(record);
//             }
//             await loadZones();
//             setView("list");
//             setEditRecord(null);
//         } catch (err) {
//             console.error("Save Error:", err);
//             alert(err.message || "Something went wrong while saving");
//         }
//     };

//     const handleDelete = async (id) => {
//         try {
//             const record = records.find((r) => r.id === id);
//             if (!record)
//             {
//                 alert("Record not found"); return;
//             }
//             // if (!window.confirm("Delete this zone image?")) return;
//             await deleteZone(record._id);
//             showSuccess("Zone Deleted Successfuly")
//             await loadZones();
//         } catch (err) {
//             console.error("Delete Error:", err);
//            showError
//         }
//     };

//     // ── Routing ──
//     if (view === "add") {
//         return (
//             <EditorView
//                 onSave={handleSave}
//                 onCancel={() => setView("list")}
//             />
//         );
//     }

//     if (view === "edit" && editRecord) {
//         return (
//             <EditorView
//                 initialRecord={editRecord}
//                 onSave={handleSave}
//                 onCancel={() => { setView("list"); setEditRecord(null); }}
//             />
//         );
//     }

//     return (
//         <ListView
//             records={records}
//             onAdd={() => setView("add")}
//             onEdit={(r) => { setEditRecord(r); setView("edit"); }}
//             onDelete={handleDelete}
//         />
//     );
// }
import { useState, useEffect } from "react";
import ListView from "./List/ListView";
import EditorView from "./Editor/EditorView";
import { getZones, createZone, updateZone, deleteZone } from "../../Api/zoneImagesApis";
import { showError, showSuccess } from "./common/Toaster";

// ─── Loader Overlay ────────────────────────────────────────────────────────────
function Loader() {
    return (
        <div style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999,
        }}>
            <div style={{
                width: 48, height: 48,
                border: "5px solid #fff",
                borderTop: "5px solid #4f46e5",
                borderRadius: "50%",
                animation: "spin 0.75s linear infinite",
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

// ─── Heatmap Root ─────────────────────────────────────────────────────────────
export default function HeatMap() {
    const [view, setView] = useState("list");       // "list" | "add" | "edit"
    const [records, setRecords] = useState([]);
    const [editRecord, setEditRecord] = useState(null);
    const [loading, setLoading] = useState(false);  // ← loader state

    useEffect(() => {
        loadZones();
    }, []);

    // ── Data helpers ──
    const loadZones = async () => {
        setLoading(true);
        try {
            const data = await getZones();
            const normalized = data.map((r) => ({ ...r, id: r._id }));
            setRecords(normalized);
        } catch (err) {
            console.error("Load Error:", err);
            showError(err.message || "Failed to load zones");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (record) => {
        setLoading(true);
        try {
            if (record._id) {
                await updateZone(record._id, record);
                showSuccess("Zone updated successfully");
            } else {
                await createZone(record);
                showSuccess("Zone created successfully");
            }
            await loadZones();
            setView("list");
            setEditRecord(null);
        } catch (err) {
            console.error("Save Error:", err);
            showError(err.message || "Something went wrong while saving");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            const record = records.find((r) => r.id === id);
            if (!record) {
                showError("Record not found");
                return;
            }
            await deleteZone(record._id);
            showSuccess("Zone deleted successfully");
            await loadZones();
        } catch (err) {
            console.error("Delete Error:", err);
            showError(err.message || "Failed to delete zone");
        } finally {
            setLoading(false);
        }
    };

    // ── Routing ──
    return (
        <>
            {loading && <Loader />}

            {view === "add" && (
                <EditorView
                    onSave={handleSave}
                    onCancel={() => setView("list")}
                />
            )}

            {view === "edit" && editRecord && (
                <EditorView
                    initialRecord={editRecord}
                    onSave={handleSave}
                    onCancel={() => { setView("list"); setEditRecord(null); }}
                />
            )}

            {view === "list" && (
                <ListView
                    records={records}
                    onAdd={() => setView("add")}
                    onEdit={(r) => { setEditRecord(r); setView("edit"); }}
                    onDelete={handleDelete}
                />
            )}
        </>
    );
}