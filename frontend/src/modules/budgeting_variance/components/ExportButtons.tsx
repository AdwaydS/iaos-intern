import { Icon } from "../../../components/Icon";

interface ExportButtonsProps {
  filename: string;
  rows: Record<string, unknown>[];
  columns: { key: string; label: string }[];
}

function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportButtons({ filename, rows, columns }: ExportButtonsProps) {
  const exportExcel = () => {
    const header = columns.map((c) => c.label).join(",");
    const body = rows.map((row) =>
      columns.map((c) => {
        const val = row[c.key];
        const str = val == null ? "" : String(val);
        return str.includes(",") ? `"${str}"` : str;
      }).join(",")
    );
    downloadBlob([header, ...body].join("\n"), `${filename}.csv`, "text/csv");
  };

  const exportPdf = () => {
    const html = `
      <html><head><title>${filename}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; }
        h1 { font-size: 18px; color: #1e293b; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
        th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
        th { background: #f1f5f9; }
      </style></head><body>
      <h1>${filename}</h1>
      <table><thead><tr>${columns.map((c) => `<th>${c.label}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((row) =>
        `<tr>${columns.map((c) => `<td>${row[c.key] ?? ""}</td>`).join("")}</tr>`
      ).join("")}</tbody></table></body></html>`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      w.print();
    }
  };

  return (
    <div className="bgt-export-btns">
      <button type="button" className="btn btn-ghost bgt-export-btn" onClick={exportExcel}>
        <Icon name="file-check" size={16} />
        Export Excel
      </button>
      <button type="button" className="btn btn-ghost bgt-export-btn" onClick={exportPdf}>
        <Icon name="clipboard" size={16} />
        Export PDF
      </button>
    </div>
  );
}
