import { describe, expect, test } from 'vitest';

import { formatTimestamp, sanitizeSpreadsheetCell } from './helpers.js';

describe('sanitizeSpreadsheetCell', () => {
  test('prefixes a leading equals sign with a quote', () => {
    const value = '=SUM(A1:A2)';

    const result = sanitizeSpreadsheetCell(value);

    expect(result).toBe("'=SUM(A1:A2)");
  });

  test('prefixes leading +, -, @, tab, and carriage return', () => {
    const values = ['+1', '-1', '@cmd', '\tx', '\rx'];

    const results = values.map(sanitizeSpreadsheetCell);

    expect(results).toEqual(["'+1", "'-1", "'@cmd", "'\tx", "'\rx"]);
  });

  test('leaves safe values unchanged', () => {
    const values = ['Ann', 'a@x.co', 'a=b', ''];

    const results = values.map(sanitizeSpreadsheetCell);

    expect(results).toEqual(['Ann', 'a@x.co', 'a=b', '']);
  });
});

describe('formatTimestamp', () => {
  test('formats a date as DDMMYYYYHHmmss', () => {
    const date = new Date(2026, 5, 8, 14, 30, 45);

    const result = formatTimestamp(date);

    expect(result).toBe('08062026143045');
  });

  test('zero-pads single-digit day, month, hour, minute, and second', () => {
    const date = new Date(2026, 0, 3, 4, 5, 6);

    const result = formatTimestamp(date);

    expect(result).toBe('03012026040506');
  });
});
