import * as XLSX from 'xlsx';
import {
  BULK_TEMPLATE_FILENAME,
  BULK_UPLOAD_COLUMNS,
} from '../constants/bulk-upload-template';

export function downloadBulkUploadTemplate() {
  const headers = BULK_UPLOAD_COLUMNS.map((col) =>
    'required' in col && col.required ? `${col.header}*` : col.header,
  );
  const exampleRow = BULK_UPLOAD_COLUMNS.map((col) => col.example ?? '');

  const sheet = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
  sheet['!cols'] = BULK_UPLOAD_COLUMNS.map((col) => ({
    wch: Math.max(col.header.length + 2, 14),
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, '가맹점등록');

  XLSX.writeFile(workbook, BULK_TEMPLATE_FILENAME);
}
