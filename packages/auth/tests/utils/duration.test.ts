import { parseDuration } from '$lib/utils/duration';

test.each([
  ['1d', 86400],
  ['3h', 3 * 3600],
  ['45m', 45 * 60],
  ['10s', 10],
  ['1d3h', 86400 + 3 * 3600],
  ['1d3h45m', 86400 + 3 * 3600 + 45 * 60],
  ['1d3h45m10s', 86400 + 3 * 3600 + 45 * 60 + 10],
  ['1d 3h', 86400 + 3 * 3600],
  ['1d 3h 45m', 86400 + 3 * 3600 + 45 * 60],
  ['1d 3h 45m 10s', 86400 + 3 * 3600 + 45 * 60 + 10],
])('correctly parses input: `%s`', (input, expected) => {
  expect(parseDuration(input)).toBe(expected);
});

test.each([
  [' 1d', 86400],
  ['1d ', 86400],
  [' 1d ', 86400],
  [' 1d3h45m10s', 86400 + 3 * 3600 + 45 * 60 + 10],
  ['1d3h45m10s ', 86400 + 3 * 3600 + 45 * 60 + 10],
  [' 1d3h45m10s ', 86400 + 3 * 3600 + 45 * 60 + 10],
  [' 1d 3h 45m 10s', 86400 + 3 * 3600 + 45 * 60 + 10],
  ['1d 3h 45m 10s ', 86400 + 3 * 3600 + 45 * 60 + 10],
  [' 1d 3h 45m 10s ', 86400 + 3 * 3600 + 45 * 60 + 10],
])('correctly parses input with leading and/or trailing whitespace: `%s`', (input, expected) => {
  expect(parseDuration(input)).toBe(expected);
});

test('returns `null` for an invalid input', () => {
  expect(parseDuration('abc')).toBeNull();
});

test('returns `null` for an empty input', () => {
  expect(parseDuration('')).toBeNull();
});

test('returns `null` for a whitespace-only input', () => {
  expect(parseDuration(' ')).toBeNull();
});

test('returns `null` for an input with an unrecognized unit: `1x`', () => {
  expect(parseDuration('1x')).toBeNull();
});

test('returns `null` for an input with an unrecognized unit: `1d1x`', () => {
  expect(parseDuration('1d1x')).toBeNull();
});

test('returns `null` for an input with an unrecognized unit: `1d1x1m`', () => {
  expect(parseDuration('1d1x1m')).toBeNull();
});

test('returns `null` for an input with an unrecognized unit: `1d 1x`', () => {
  expect(parseDuration('1d 1x')).toBeNull();
});

test('returns `null` for an input with an unrecognized unit: `1d 1x 1m`', () => {
  expect(parseDuration('1d 1x 1m')).toBeNull();
});

test('returns `null` for an input containing a number without a following unit: `1`', () => {
  expect(parseDuration('1')).toBeNull();
});

test('returns `null` for an input containing a number without a following unit: `1d1`', () => {
  expect(parseDuration('1d1')).toBeNull();
});

test('returns `null` for an input containing a number without a following unit: `1d 1`', () => {
  expect(parseDuration('1d 1')).toBeNull();
});

test('returns `null` for an input containing a number without a following unit: `1d 1 1m`', () => {
  expect(parseDuration('1d 1 1m')).toBeNull();
});

test('returns `null` for an input containing a unit without a preceding number: `d`', () => {
  expect(parseDuration('d')).toBeNull();
});

test('returns `null` for an input containing a unit without a preceding number: `d3h`', () => {
  expect(parseDuration('d3h')).toBeNull();
});

test('returns `null` for an input containing a unit without a preceding number: `d 3h`', () => {
  expect(parseDuration('d 3h')).toBeNull();
});

test('returns `null` for an input containing a unit without a preceding number: `1d h 45m`', () => {
  expect(parseDuration('1d h 45m')).toBeNull();
});

test('returns `null` for an input exceeding the maximum number of digits: `123456s`', () => {
  expect(parseDuration('123456s')).toBeNull();
});
