import * as XLSX from "xlsx";

export const downloadExcel = (
  jsonData,
  fileName,
  reportName,
  filters = {}
) => {
  const { dateRange, user } = filters;

  // 1. Header rows
  const headerRows = [
    [reportName || ""],
    [`Selected Date : ${dateRange || "-"}`],
    // [`Report Timings : ${reportTime || "-"}`],
    [`User Name : ${user || "-"}`],
    [], // empty row
  ];

  // 2. Convert JSON to sheet rows
  const dataRows = XLSX.utils.json_to_sheet(jsonData, { origin: -1 });

  // 3. Create new sheet manually
  const ws = XLSX.utils.aoa_to_sheet(headerRows);

  // Append JSON rows below header
  XLSX.utils.sheet_add_json(ws, jsonData, {
    origin: headerRows.length,
  });

  // 4. Make header bold
  ws["A1"].s = { font: { bold: true, sz: 14 } };

  // 5. Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");

  XLSX.writeFile(wb, `${fileName}.xlsx`);
};
