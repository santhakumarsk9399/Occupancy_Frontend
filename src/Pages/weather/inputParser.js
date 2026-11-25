function splitList(str) {
  return String(str ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseQuickInput(value) {
  if (!value || typeof value !== "string") return null;

  const parts = splitList(value);
  if (parts.length < 4) return null;

  const [monthPart, yearPart, ...locationParts] = parts;
  const month = Number(monthPart);
  const year = Number(yearPart);

  if (!Number.isFinite(month) || !Number.isFinite(year)) return null;

  if (locationParts.length === 2) {
    return {
      month,
      year,
      latInput: locationParts[0],
      lonInput: locationParts[1],
      raw: value.trim(),
    };
  }

  if (locationParts.length >= 4 && locationParts.length % 2 === 0) {
    const lats = locationParts.filter((_, index) => index % 2 === 0);
    const lons = locationParts.filter((_, index) => index % 2 === 1);
    return {
      month,
      year,
      latInput: lats.join(", "),
      lonInput: lons.join(", "),
      raw: value.trim(),
    };
  }

  return null;
}

export function parseLoadParams(search) {
  if (!search) return null;
  const params = new URLSearchParams(search);
  const candidates = [params.get("input"), params.get("q"), params.get("values")];

  for (const candidate of candidates) {
    if (candidate) {
      const parsed = parseQuickInput(candidate);
      if (parsed) return parsed;
    }
  }

  const month = params.get("month");
  const year = params.get("year");
  const lat = params.get("lat") || params.get("latitude");
  const lon = params.get("lon") || params.get("longitude");
  const location = params.get("location") || params.get("place") || params.get("city");

  if (!month && !year && !lat && !lon && !location) return null;

  return {
    month: Number(month) || 1,
    year: Number(year) || new Date().getFullYear(),
    latInput: lat || "",
    lonInput: lon || "",
    locationInput: location || "",
    raw: [month, year, lat, lon, location].filter(Boolean).join(","),
  };
}
