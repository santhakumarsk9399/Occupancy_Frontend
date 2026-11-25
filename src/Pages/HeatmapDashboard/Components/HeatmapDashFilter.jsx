import { useState, useEffect, useRef } from "react";
import { getToken } from "../../Settings_Heatmap/components/Heatmaps/utils/sessionHelper";
import api from "../../Settings_Heatmap/utils/AxiosInstance";
import { showSuccess,showError} from "../../CommonComponents/Toaster";

// const SESSION_KEY_PREFIX = "heatmap_applied_filters";

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

  // const storageKey = `${SESSION_KEY_PREFIX}_${username || vid || "guest"}`;
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

      // ===========================
      // Save selected filter in DB
      // ===========================
      const response = await api.post(
        "/heatmapConfig/updateDashboardFilter",
        {
          vid,
          username,
          zone: zones.map((z) => z.label).join(","),
        },
        getHeaders()
      );

      if (response.data?.success) {
        await filters(); // Reload saved filter from DB

        showSuccess("Filters Applied Successfully");
        setShowFilters(false);
      } else {
        showError("Failed to save filter.");
      }

    } catch (err) {
      console.error(err);
      showError("Failed to apply filters. Please try again.");
    }
  };
  const filters = async () => {
    try {
      const res = await api.post(
        "/heatmapConfig/getHeatmapFilter1",
        { vid ,username },
        getHeaders(),
      );

      const responseData = res.data?.data || [];
      const savedFilter = res.data?.savedFilter || [];

      console.log(responseData, savedFilter);
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
      if (savedFilter.length > 0) {
        const selected = convertSavedFilter(savedFilter, responseData);

        const applied = {
          ...selected,
          filters: buildFiltersPayload(
            responseData,
            selected.malls,
            selected.floors,
            selected.zones
          ),
        };

        setSelectedMallsData(selected.malls);
        setSelectedFloorsData(selected.floors);
        setSelectedZonesData(selected.zones);
        setAppliedFilters(applied);
      } else {
        setSelectedMallsData(defaults.malls);
        setSelectedFloorsData(defaults.floors);
        setSelectedZonesData(defaults.zones);
        setAppliedFilters(defaults);
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
  // const convertSavedFilter = (saved = []) => {
  //   const malls = [];
  //   const floors = [];
  //   const zones = [];

  //   saved.forEach((mall) => {
  //     malls.push({
  //       value: String(mall.mallId),
  //       label: mall.mallName,
  //     });

  //     (mall.floors || []).forEach((floor) => {
  //       floors.push({
  //         value: String(floor.floorId),
  //         label: floor.floorName,
  //         mallId: String(mall.mallId),
  //       });

  //       (floor.zones || []).forEach((zone) => {
  //         zones.push({
  //           value: String(zone.zoneId),
  //           label: zone.zoneName,
  //           floorId: String(floor.floorId),
  //         });
  //       });
  //     });
  //   });

  //   return { malls, floors, zones };
  // };
  const convertSavedFilter = (saved = [], filterTree = []) => {
    const malls = [];
    const floors = [];
    const zones = [];

    saved.forEach((savedMall) => {
      // Find actual mall from master data using mallName
      const masterMall = filterTree.find(
        (mall) =>
          String(mall.mallName).trim().toLowerCase() ===
          String(savedMall.mallName).trim().toLowerCase()
      );

      if (!masterMall) return;

      // Use MASTER mallId, not savedFilter mallId
      malls.push({
        value: String(masterMall.mallId),
        label: masterMall.mallName,
      });

      (savedMall.floors || []).forEach((savedFloor) => {
        // Find actual floor from master mall
        const masterFloor = (masterMall.floors || []).find(
          (floor) =>
            String(floor.floorId) === String(savedFloor.floorId) ||
            String(floor.floorName).trim().toLowerCase() ===
            String(savedFloor.floorName).trim().toLowerCase()
        );

        if (!masterFloor) return;

        floors.push({
          value: String(masterFloor.floorId),
          label: masterFloor.floorName,

          // IMPORTANT: actual mallId from master data
          mallId: String(masterMall.mallId),
        });

        (savedFloor.zones || []).forEach((savedZone) => {
          // Find actual zone from master floor
          const masterZone = (masterFloor.zones || []).find(
            (zone) =>
              String(zone.zoneId) === String(savedZone.zoneId) ||
              String(zone.zoneName).trim().toLowerCase() ===
              String(savedZone.zoneName).trim().toLowerCase()
          );

          if (!masterZone) return;

          zones.push({
            value: String(masterZone.zoneId),
            label: masterZone.zoneName,

            // IMPORTANT: actual floorId from master data
            floorId: String(masterFloor.floorId),
          });
        });
      });
    });

    return { malls, floors, zones };
  };
  useEffect(() => {
    if (hasFetchedRef.current) return;

    hasFetchedRef.current = true;

    filters();
  }, []);

  //   const handleApplyFilters = async (data) => {
  //       try {
  //           const malls = data?.malls ?? selectedMallsData;
  //           const floors = data?.floors ?? selectedFloorsData;
  //           const zones = data?.zones ?? selectedZonesData;

  //           const selectedFilters = buildFiltersPayload(
  //               filterTree,
  //               malls,
  //               floors,
  //               zones
  //           );

  //           const next = {
  //               malls,
  //               floors,
  //               zones,
  //               filters: selectedFilters,
  //           };

  //           setSelectedMallsData(malls);
  //           setSelectedFloorsData(floors);
  //           setSelectedZonesData(zones);
  //           setAppliedFilters(next);

  //           sessionStorage.setItem(storageKey, JSON.stringify(next));

  //           showSuccess("Filters Applied Successfully");

  //           setShowFilters(false);
  //       } catch (err) {
  //           console.error(err);
  //           showError("Failed to apply filters. Please try again.");
  //       }
  // };
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
