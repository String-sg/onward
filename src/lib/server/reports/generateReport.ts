import { PassThrough, Readable } from 'node:stream';

import ExcelJS from 'exceljs';

import { sanitizeSpreadsheetCell } from './helpers.js';

const SPREADSHEET_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export interface Column<Row> {
  header: string;
  value: (row: Row) => string | number | boolean;
}

export interface GenerateReportOptions<Row, Cursor> {
  filename: string;
  sheetName: string;
  columns: Column<Row>[];
  fetchBatch: (
    cursor: Cursor | undefined,
  ) => Promise<{ rows: Row[]; nextCursor: Cursor | undefined }>;
  onError?: (err: unknown) => void;
}

export const generateReport = <Row, Cursor>(
  options: GenerateReportOptions<Row, Cursor>,
): Response => {
  const { filename, sheetName, columns, fetchBatch, onError } = options;

  const passThrough = new PassThrough();
  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: passThrough });
  const sheet = workbook.addWorksheet(sheetName);

  const write = async (): Promise<void> => {
    try {
      sheet.addRow(columns.map((column) => column.header)).commit();

      let cursor: Cursor | undefined = undefined;
      do {
        const { rows, nextCursor } = await fetchBatch(cursor);
        for (const row of rows) {
          const cells = columns.map((column) => {
            const cell = column.value(row);
            return typeof cell === 'string' ? sanitizeSpreadsheetCell(cell) : cell;
          });
          sheet.addRow(cells).commit();
        }
        cursor = nextCursor;
      } while (cursor !== undefined);

      sheet.commit();
      await workbook.commit();
    } catch (err) {
      if (onError) {
        onError(err);
      }
      passThrough.destroy(err instanceof Error ? err : new Error('generate report failed'));
    }
  };

  // Detached on purpose: the Response must return while the workbook is still
  // being written, so the stream can flow to the client. The loop owns its own
  // error handling above; `void` marks the intentional fire-and-forget.
  void write();

  return new Response(Readable.toWeb(passThrough) as ReadableStream<Uint8Array>, {
    headers: {
      'Content-Type': SPREADSHEET_CONTENT_TYPE,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
};
