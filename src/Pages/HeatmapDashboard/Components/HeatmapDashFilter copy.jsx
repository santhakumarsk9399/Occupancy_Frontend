import { useState, useEffect, useRef } from "react";
import { getToken } from "../../Settings_Heatmap/components/Heatmaps/utils/sessionHelper";
import api from "../../Settings_Heatmap/utils/AxiosInstance";
import { showSuccess,showError} from "../../CommonComponents/Toaster";

const SESSION_KEY_PREFIX = "heatmap_applied_filters";

export default function useHeatmapDashFilters({ onSuccessToast } = {}) {
  const [showFilters, setShowFilters] = useState(false);

  // MASTER DATA (flat lists, built from the nested API response)
  const [mallsData, setMallsData] = useState([]);
  const [floorsData, setFloorsData] = useState([]);
  const [zonesData, setZonesData] = useState([]);

  // SELECTED DATA (what's checked inside the filter modal right now)
  const [selectedMallsData, setSelectedMallsData] = useState([]);
  const [selectedFloorsData, setSelectedFloorsData] = useState([]);
  const [selectedZonesData, setSelectedZonesData] = useState([]);
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  // APPLIED FILTERS (what every tab actually reads from)
  const [appliedFilters, setAppliedFilters] = useState({
    malls: [],
    floors: [],
    zones: [],
  });
  const [filterTree, setFilterTree] = useState([]);
  // const [appliedFilters, setAppliedFilters] = useState(null);
  const hasFetchedRef = useRef(false);

  const vid = sessionStorage.getItem("vid");
  const username = sessionStorage.getItem("username");

  const getHeaders = () => ({
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const storageKey = `${SESSION_KEY_PREFIX}_${username || vid || "guest"}`;
  const flattenFilterData = (mallsResponse = []) => {
    const flatMalls = [];
    const flatFloors = [];
    const flatZones = [];

    mallsResponse.forEach((m) => {
      flatMalls.push({
        value: String(m.mallId),
        label: m.mallName,
      });

      (m.floors || []).forEach((f) => {
        flatFloors.push({
          value: String(f.floorId),
          label: f.floorName,
          mallId: String(m.mallId),
        });

        (f.zones || []).forEach((z) => {
          flatZones.push({
            value: String(z.zoneId),
            label: z.zoneName,
            floorId: String(f.floorId),
          });
        });
      });
    });

    return { flatMalls, flatFloors, flatZones };
  };

  const filters = async () => {
    try {
      const res = await api.post(
        "/heatmapConfig/getHeatmapFilter1",
        { vid ,username },
        getHeaders(),
      );

      const responseData = res.data?.data || [];

      setFilterTree(responseData);

      const { flatMalls, flatFloors, flatZones } =
        flattenFilterData(responseData);
      setMallsData(flatMalls);
      setFloorsData(flatFloors);
      setZonesData(flatZones);
      const defaultFilters = [];

      responseData.forEach((mall) => {
        (mall.floors || []).forEach((floor) => {
          (floor.zones || []).forEach((zone) => {
            defaultFilters.push({
              mallName: mall.mallName,
              floorName: floor.floorName,
              zoneName: zone.zoneName,
            });
          });
        });
      });

      const defaults = {
        malls: flatMalls,
        floors: flatFloors,
        zones: flatZones,
        filters: defaultFilters,
      };
      const saved = sessionStorage.getItem(storageKey);

      if (saved) {
        const parsed = JSON.parse(saved);

        setSelectedMallsData(parsed.malls || []);
        setSelectedFloorsData(parsed.floors || []);
        setSelectedZonesData(parsed.zones || []);
        setAppliedFilters({
          malls: parsed.malls || [],
          floors: parsed.floors || [],
          zones: parsed.zones || [],
          filters: parsed.filters || [],
        });
      } else {
        setSelectedMallsData(defaults.malls);
        setSelectedFloorsData(defaults.floors);
        setSelectedZonesData(defaults.zones);
        setAppliedFilters(defaults);

        sessionStorage.setItem(storageKey, JSON.stringify(defaults));
      }

      // ✅ Filters are completely initialized
      setFiltersLoaded(true);

      return res;
    } catch (err) {
      console.error("Error loading heatmap filters:", err);

      // Prevent the app from waiting forever if the API fails
      setFiltersLoaded(true);
    }
  };
  useEffect(() => {
    if (hasFetchedRef.current) return;

    hasFetchedRef.current = true;

    filters();
  }, []);
  const buildFiltersPayload = (
    filterTree,
    selectedMalls,
    selectedFloors,
    selectedZones,
  ) => {
    const mallIds = new Set(selectedMalls.map((m) => String(m.value)));
    const floorIds = new Set(selectedFloors.map((f) => String(f.value)));
    const zoneIds = new Set(selectedZones.map((z) => String(z.value)));

    const filters = [];

    filterTree.forEach((mall) => {
      if (!mallIds.has(String(mall.mallId))) return;

      (mall.floors || []).forEach((floor) => {
        if (!floorIds.has(String(floor.floorId))) return;

        (floor.zones || []).forEach((zone) => {
          if (!zoneIds.has(String(zone.zoneId))) return;

          filters.push({
            mallName: mall.mallName,
            floorName: floor.floorName,
            zoneName: zone.zoneName,
          });
        });
      });
    });

    return filters;
  };

    const handleApplyFilters = async (data) => {
        try {
            const malls = data?.malls ?? selectedMallsData;
            const floors = data?.floors ?? selectedFloorsData;
            const zones = data?.zones ?? selectedZonesData;

            const selectedFilters = buildFiltersPayload(
                filterTree,
                malls,
                floors,
                zones
            );

            const next = {
                malls,
                floors,
                zones,
                filters: selectedFilters,
            };

            setSelectedMallsData(malls);
            setSelectedFloorsData(floors);
            setSelectedZonesData(zones);
            setAppliedFilters(next);

            sessionStorage.setItem(storageKey, JSON.stringify(next));

            showSuccess("Filters Applied Successfully");

            setShowFilters(false);
        } catch (err) {
            console.error(err);
            showError("Failed to apply filters. Please try again.");
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
    filterTree,
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
    filtersLoaded,
    buildFiltersPayload,
  };
}
