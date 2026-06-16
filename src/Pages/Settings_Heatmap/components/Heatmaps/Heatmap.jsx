
import { useState, useEffect } from "react";
import ListView from "./List/ListView";
import EditorView from "./Editor/EditorView";
import {
    getZones,
    createZone,
    updateZone,
    deleteZone
} from "../../Api/zoneImagesApis";

import { showError, showSuccess } from "../../../CommonComponents/Toaster";
import DashHeader from "../../../CommonComponents/Dashboard_Header";
import { de } from "date-fns/locale";

// ─── Loader ─────────────────────────────────────────
function Loader() {
    return (
        <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
        }}>
            <div style={{
                width: 48,
                height: 48,
                border: "5px solid #fff",
                borderTop: "5px solid #4f46e5",
                borderRadius: "50%",
                animation: "spin 0.75s linear infinite",
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

// ─── Heatmap Root ───────────────────────────────────
export default function HeatMap() {
    const [view, setView] = useState("list");
    const [records, setRecords] = useState([]);
    const [editRecord, setEditRecord] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadZones();
    }, []);

    // ── Load
    const loadZones = async () => {
        setLoading(true);
        try {
            const data = await getZones();
            setRecords(data);
        } catch (err) {
            console.error("Load Error:", err);
            showError(err.message || "Failed to load zones");
        } finally {
            setLoading(false);
        }
    };

    // ── Save
    const handleSave = async (record) => {
        console.log(record)
        setLoading(true);
        try {
            if (record.heatmapid) {
                console.log(record)
                await updateZone(record);
                showSuccess("Zone updated successfully");
            } else {
                // console.log(record,"heatmappage")
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

    // ── Delete
    const handleDelete = async (id) => {
        setLoading(true);

        try {
            const record = records.find((r) => r.HeatMapID === id);

            if (!record) {
                showError("Record not found");
                return;
            }

            const deleteData = await deleteZone(record.HeatMapID);

            console.log(deleteData);

            if (deleteData?.success) {
                showSuccess(deleteData.message || "Zone deleted successfully");
                await loadZones();
            } else {
                showError(deleteData?.message || "Failed to delete zone");
            }

        } catch (err) {
            console.error("Delete Error:", err);
            showError(err.message || "Failed to delete zone");
        } finally {
            setLoading(false);
        }
    };
    // ── UI Routing
    return (
        <>
            {loading && <Loader />}
            <DashHeader
                title="Heatmap"
            />
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
                    onCancel={() => {
                        setView("list");
                        setEditRecord(null);
                    }}
                />
            )}

            {view === "list" && (
                <ListView
                    records={records}
                    onAdd={() => setView("add")}
                    onEdit={(r) => {
                        setEditRecord(r);
                        setView("edit");
                    }}
                    onDelete={handleDelete}
                />
            )}
        </>
    );
}