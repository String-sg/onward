import { randomBytes } from 'node:crypto';
import { TextDecoder, TextEncoder } from 'node:util';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Masks the input using a one-time pad and returns a base64url-encoded string
 * containing the one-time pad and the XOR-encrypted data.
 *
 * @param input - The string to mask.
 * @returns A base64url-encoded string containing the one-time pad and the XOR-encrypted data.
 */
export function mask(input: string): string {
  const buf = encoder.encode(input);
  const otp = new Uint8Array(randomBytes(buf.length));

  const encrypted = new Uint8Array(buf.length);
  for (let i = 0; i < buf.length; i++) {
    encrypted[i] = buf[i] ^ otp[i];
  }

  const output = new Uint8Array(buf.length * 2);
  output.set(otp, 0);
  output.set(encrypted, otp.length);

  return Buffer.from(output).toString('base64url');
}

/**
 * Unmasks the input using the one-time pad found in the input and returns the original string.
 *
 * @param input - A base64url-encoded string containing the one-time pad and the XOR-encrypted data.
 * @returns The original string.
 */
export function unmask(input: string): string {
  const buf = new Uint8Array(Buffer.from(input, 'base64url'));
  const otp = buf.subarray(0, buf.length / 2);
  const encrypted = buf.subarray(buf.length / 2);

  const output = new Uint8Array(encrypted.length);
  for (let i = 0; i < encrypted.length; i++) {
    output[i] = encrypted[i] ^ otp[i];
  }

  return decoder.decode(output);
}
