// src/components/YourDashboardFolder/useDashFilters.js
import { useState, useEffect, useRef } from "react";
import axios from "axios";


export default function useDashFilters({ onSuccessToast } = {}) {
  const [showFilters, setShowFilters] = useState(false);
  const [countriesData, setCountriesData] = useState([]);
  const [citiesData, setCitiesData] = useState([]);
  const [zonesData, setZonesData] = useState([]);
  const [selectedCountriesData, setselectedCountriesData] = useState([]);
  const [selectedCitiesData, setselectedCitiesData] = useState([]);
  const [selectedZonesData, setselectedZonesData] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState({
    countries: [],
    cities: [],
    zones: [],
  });

  const hasFetchedRef = useRef(false);
  const token = sessionStorage.getItem("token");
  const vid = sessionStorage.getItem("vid");
  const username = sessionStorage.getItem("username");
  const API_URL = import.meta.env.VITE_API_URL;

  const filters = async () => {
    try {
      const payload = { vid, username, country: "", city: "", zone: "" };
      const res = await axios.get(
        `${API_URL}/dashboard/dashboardFilter/filters`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: payload,
        }
      );

      setCountriesData(
        (res.data?.allFilters?.countries || []).map((c) => ({
          value: String(c.id),
          label: c.Country,
        }))
      );
      setCitiesData(
        (res.data?.allFilters?.cities || []).map((ci) => ({
          value: String(ci.id),
          label: ci.City,
          countryId: String(ci.countryId),
        }))
      );
      setZonesData(
        (res.data?.allFilters?.zones || []).map((z) => ({
          value: String(z.id),
          label: z.Zonename,
          cityId: String(z.cityId),
        }))
      );

      setselectedCountriesData(
        (res.data?.selectedFilters?.countries || []).map((c) => ({
          value: String(c.id),
          label: c.Country,
        }))
      );
      setselectedCitiesData(
        (res.data?.selectedFilters?.cities || []).map((ci) => ({
          value: String(ci.id),
          label: ci.City,
          countryId: String(ci.countryId),
        }))
      );
      setselectedZonesData(
        (res.data?.selectedFilters?.zones || []).map((z) => ({
          value: String(z.id),
          label: z.Zonename,
          cityId: String(z.cityId),
        }))
      );
    } catch (err) {
      console.error("Error loading master data (filters):", err);
    }
  };

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    filters();
  }, []);

  const handleApplyFilters = async (data) => {
    const payload = {
      vid,
      username,
      zone: data.zones?.map((o) => o.label).join(",") || "",
    };

    try {
      const response = await axios.post(
        `${API_URL}/dashboard/dashboardFilter/updateFilters`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response?.data?.message && typeof onSuccessToast === "function") {
        onSuccessToast(response.data.message);
      }
      // refresh master data (selectedFilters)
      await filters();
    } catch (err) {
      console.error("Error applying filters:", err);
    }

    setShowFilters(false);
  };

  return {
    showFilters,
    setShowFilters,
    countriesData,
    citiesData,
    zonesData,
    selectedCountriesData,
    selectedCitiesData,
    selectedZonesData,
    appliedFilters,
    setAppliedFilters,
    filters,
    handleApplyFilters,
  };
}
