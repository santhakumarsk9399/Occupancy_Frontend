# Separate Health Report pages

Files:
- `HealthReportFilters.jsx` + `HealthReportFilters.css`: filters / first page.
- `HealthReportResults.jsx` + `HealthReportResults.css`: results / second page with charts, grid, and 15-minute row-click modal.

Install dependencies:
```bash
npm install recharts react-icons
```

Example parent component to switch between pages:
```jsx
import React, { useState } from "react";
import HealthReportFilters from "./HealthReportFilters";
import HealthReportResults from "./HealthReportResults";

export default function HealthReport() {
  const [filters, setFilters] = useState(null);

  return filters ? (
    <HealthReportResults filters={filters} onBack={() => setFilters(null)} />
  ) : (
    <HealthReportFilters onGenerate={setFilters} />
  );
}
```

The pages currently use mock report rows. Filters are simple single-select placeholders; swap them for your Historical Reports multi-select component when integrating. The PDF button calls browser print, while Excel exports CSV.
