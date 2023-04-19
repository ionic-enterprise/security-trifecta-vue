import { vi } from 'vitest';

export const useBackendAPI = vi.fn().mockReturnValue({
  client: {
    delete: vi.fn().mockResolvedValue({ data: null }),
    get: vi.fn().mockResolvedValue({ data: null }),
    post: vi.fn().mockResolvedValue({ data: null }),
  },
});
