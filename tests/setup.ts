import { webcrypto } from 'node:crypto';
import '@testing-library/jest-dom/vitest';

if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
  });
}
