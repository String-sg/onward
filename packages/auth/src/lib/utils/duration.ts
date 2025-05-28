const TIME_UINT_REGEX = /(\d{1,5})([dmhs]{1})/;

/**
 * Parses the input and returns the total number of seconds, or `null` if the input is invalid.
 *
 * The input must consist of one or more time units.
 * Each time unit is an integer (up to 5 digits) followed by a unit character:
 * - `d` = days
 * - `h` = hours
 * - `m` = minutes
 * - `s` = seconds
 *
 * @param input - The string to parse.
 * @returns The parsed duration in seconds, or `null` if the input is invalid.
 *
 * @example
 * ```ts
 * parseDuration("1d3h45m");  // 86400 + 10800 + 2700 = 99900
 * parseDuration("45m");      // 2700
 * parseDuration("10x");      // null (invalid unit)
 * parseDuration("");         // null (empty string)
 * ```
 */
export default function parseDuration(input: string): number | null {
  input = input.trim();

  // Return `null` if the input is an empty string.
  if (!input.length) {
    return null;
  }

  let result = 0;
  while (input.length > 0) {
    const matchArray = input.match(TIME_UINT_REGEX);
    if (!matchArray) {
      return null;
    }

    const [match, value, unit] = matchArray;
    input = input.trimStart();

    // Return `null` if the match is not at the start of the input string.
    if (!input.startsWith(match)) {
      return null;
    }

    switch (unit) {
      case 'd':
        result += Number(value) * 60 * 60 * 24;
        break;
      case 'h':
        result += Number(value) * 60 * 60;
        break;
      case 'm':
        result += Number(value) * 60;
        break;
      case 's':
        result += Number(value);
        break;
    }

    input = input.trimStart().slice(match.length);
  }

  // Return `null` if there are unparsable characters remaining.
  if (input.length > 0) {
    return null;
  }

  return result;
}
