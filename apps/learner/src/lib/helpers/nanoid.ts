import { customAlphabet } from 'nanoid';

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
export const nanoid = customAlphabet(ALPHABET, 32);
