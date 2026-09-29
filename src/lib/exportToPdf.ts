/** Draws a simple landscape table into a PDF and downloads it. jsPDF is loaded on demand (it's large). */
export async function exportToPdf(opts: {
  title: string;
  subtitle?: string;
  columns: string[];
  rows: (string | number)[][];
  filename: string;
  /** Column indexes (0-based) to right-align, e.g. amounts. */
  rightAlign?: number[];
}): Promise<void> {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(opts.title, 40, 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110);
  if (opts.subtitle) doc.text(opts.subtitle, 40, 58);
  doc.text(`Generated ${new Date().toLocaleString("en-GB")}`, pageW - 40, 42, { align: "right" });

  autoTable(doc, {
    startY: 72,
    head: [opts.columns],
    body: opts.rows.map((r) => r.map((c) => String(c))),
    styles: { fontSize: 8, cellPadding: 5, textColor: 30 },
    headStyles: { fillColor: [15, 32, 82], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [247, 248, 250] },
    columnStyles: Object.fromEntries((opts.rightAlign ?? []).map((i) => [i, { halign: "right" as const }])),
    margin: { left: 40, right: 40 },
    didDrawPage: () => {
      const h = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(130);
      doc.text(`Page ${doc.getNumberOfPages()}`, pageW - 40, h - 20, { align: "right" });
    },
  });
  doc.save(`${opts.filename}.pdf`);
}
