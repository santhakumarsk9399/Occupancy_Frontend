import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const downloadPDF = (
  jsonData = [],
  fileName,
  options = {}
) => {
  if (!jsonData.length) return;

  const { reportName, dateRange, user } = options;

  const keys = Object.keys(jsonData[0]);
  const rows = jsonData.map(r => keys.map(k => r[k] ?? ""));

  const doc = new jsPDF();

  // 1. Header Title
  doc.setFontSize(16);
  doc.text(reportName || "", 14, 15);

  doc.setFontSize(11);
  doc.text(`Selected Date : ${dateRange || "-"}`, 14, 25);
  doc.text(`User Name : ${user || "-"}`, 14, 32);

  let tableStartY = 45;

  // 2. Table
  autoTable(doc, {
    head: [keys],
    body: rows,
    startY: tableStartY,
  });

  doc.save(`${fileName}.pdf`);
};
