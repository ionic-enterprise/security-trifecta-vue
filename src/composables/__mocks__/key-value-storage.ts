import { vi } from 'vitest';

const mockKeyValueStorage = {
  create: vi.fn().mockResolvedValue(undefined),
  set: vi.fn().mockResolvedValue(undefined),
  get: vi.fn().mockResolvedValue('foo'),
};

export const useKeyValueStorage = () => mockKeyValueStorage;
