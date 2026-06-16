import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function useHeatmapDashFilters({ onSuccessToast } = {}) {

    const [showFilters, setShowFilters] = useState(false);

    // MASTER DATA
    const [mallsData, setMallsData] = useState([]);
    const [floorsData, setFloorsData] = useState([]);
    const [zonesData, setZonesData] = useState([]);

    // SELECTED DATA
    const [selectedMallsData, setSelectedMallsData] = useState([]);
    const [selectedFloorsData, setSelectedFloorsData] = useState([]);
    const [selectedZonesData, setSelectedZonesData] = useState([]);

    // APPLIED FILTERS
    const [appliedFilters, setAppliedFilters] = useState({
        malls: [],
        floors: [],
        zones: [],
    });

    const hasFetchedRef = useRef(false);

    const token = sessionStorage.getItem("token");
    const vid = sessionStorage.getItem("vid");
    const username = sessionStorage.getItem("username");

    const API_URL = import.meta.env.VITE_API_URL;

    // =========================================
    // LOAD FILTER MASTER DATA
    // =========================================

    const filters = async () => {

        try {

            const payload = {
                vid,
                username,
            };

            const res = await axios.get(
                `${API_URL}/heatmap/filters`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: payload,
                }
            );

            // MALLS

            setMallsData(
                (res.data?.allFilters?.malls || []).map((m) => ({
                    value: String(m.id),
                    label: m.mallName,
                }))
            );

            // FLOORS

            setFloorsData(
                (res.data?.allFilters?.floors || []).map((f) => ({
                    value: String(f.id),
                    label: f.floorName,
                    mallId: String(f.mallId),
                }))
            );

            // ZONES

            setZonesData(
                (res.data?.allFilters?.zones || []).map((z) => ({
                    value: String(z.id),
                    label: z.zoneName,
                    floorId: String(z.floorId),
                }))
            );

        } catch (err) {

            console.error(
                "Error loading heatmap filters:",
                err
            );

        }

    };

    useEffect(() => {

        if (hasFetchedRef.current) return;

        hasFetchedRef.current = true;

        filters();

    }, []);

    // =========================================
    // APPLY FILTERS
    // =========================================

    const handleApplyFilters = async () => {

        const payload = {

            vid,
            username,

            malls:
                selectedMallsData
                    ?.map((x) => x.label)
                    .join(",") || "",

            floors:
                selectedFloorsData
                    ?.map((x) => x.label)
                    .join(",") || "",

            zones:
                selectedZonesData
                    ?.map((x) => x.label)
                    .join(",") || "",

        };

        try {

            await axios.post(
                `${API_URL}/heatmap/updateFilters`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setAppliedFilters({

                malls: selectedMallsData,
                floors: selectedFloorsData,
                zones: selectedZonesData,

            });

            if (typeof onSuccessToast === "function") {
                onSuccessToast("Filters Applied");
            }

            setShowFilters(false);

        } catch (err) {

            console.error(
                "Error applying filters:",
                err
            );

        }

    };

    return {

        // MODAL
        showFilters,
        setShowFilters,

        // MASTER DATA
        mallsData,
        floorsData,
        zonesData,

        // SELECTED
        selectedMallsData,
        setSelectedMallsData,

        selectedFloorsData,
        setSelectedFloorsData,

        selectedZonesData,
        setSelectedZonesData,

        // APPLIED
        appliedFilters,
        setAppliedFilters,

        // METHODS
        filters,
        handleApplyFilters,

    };

}