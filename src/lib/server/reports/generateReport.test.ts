import { describe, expect, test, vi } from 'vitest';

import { generateReport } from './generateReport.js';

describe('generateReport', () => {
  test('drives fetchBatch until nextCursor is undefined and streams an xlsx body', async () => {
    const onError = vi.fn();
    const fetchBatch = vi
      .fn()
      .mockResolvedValueOnce({ rows: [{ a: 'x' }], nextCursor: 'c1' })
      .mockResolvedValueOnce({ rows: [{ a: 'y' }], nextCursor: undefined });

    const response = generateReport({
      filename: 'report.xlsx',
      sheetName: 'Sheet',
      columns: [{ header: 'A', value: (row: { a: string }) => row.a }],
      fetchBatch,
      onError,
    });

    const reader = response.body!.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      chunks.push(value);
    }
    const bytes = chunks.reduce((acc, c) => acc + c.byteLength, 0);

    expect(fetchBatch).toHaveBeenCalledTimes(2);
    expect(fetchBatch).toHaveBeenNthCalledWith(1, undefined);
    expect(fetchBatch).toHaveBeenNthCalledWith(2, 'c1');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(onError).not.toHaveBeenCalled();
    expect(bytes).toBeGreaterThan(0);
    expect(chunks[0][0]).toBe(0x50); // 'P' — xlsx is a zip
    expect(chunks[0][1]).toBe(0x4b); // 'K'
  });

  test('calls onError and aborts the stream when fetchBatch rejects', async () => {
    const onError = vi.fn();
    const fetchBatch = vi.fn().mockRejectedValue(new Error('boom'));

    const response = generateReport({
      filename: 'report.xlsx',
      sheetName: 'Sheet',
      columns: [{ header: 'A', value: (row: { a: string }) => row.a }],
      fetchBatch,
      onError,
    });

    const drain = async () => {
      const reader = response.body!.getReader();
      while (true) {
        const { done } = await reader.read();
        if (done) {
          break;
        }
      }
    };

    await expect(drain()).rejects.toThrow();
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  test('aborts the stream without throwing when fetchBatch rejects and no onError is given', async () => {
    const fetchBatch = vi.fn().mockRejectedValue(new Error('boom'));

    const response = generateReport({
      filename: 'report.xlsx',
      sheetName: 'Sheet',
      columns: [{ header: 'A', value: (row: { a: string }) => row.a }],
      fetchBatch,
    });

    const drain = async () => {
      const reader = response.body!.getReader();
      while (true) {
        const { done } = await reader.read();
        if (done) {
          break;
        }
      }
    };

    await expect(drain()).rejects.toThrow();
  });
});
