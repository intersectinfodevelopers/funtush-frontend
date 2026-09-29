/**
 * Cell text starting with = + - @ (or a tab/CR) is interpreted as a FORMULA by
 * Excel/Sheets. Exports contain text chosen by other people (a trekker's name,
 * a special request), so `=HYPERLINK("http://evil",…)` would run on the agency's
 * machine. Prefixing a single quote makes the spreadsheet treat it as plain text
 * (OWASP "CSV injection").
 */
export const csvCell = (value: unknown): string => {
  let text = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

export const exportToCsv = <T extends object>(data: T[], fileName: string) => {
  if (!data.length) return;

  const headers = Object.keys(data[0]) as (keyof T)[];

  const csvRows = [
    headers.join(','),
    ...data.map((row) => headers.map((header) => csvCell(row[header])).join(',')),
  ];

  const csvContent = csvRows.join('\n');

  const blob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.csv`;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
