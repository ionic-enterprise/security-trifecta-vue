import { vi } from 'vitest';

export const useSync = vi.fn().mockReturnValue(vi.fn().mockResolvedValue(undefined));
