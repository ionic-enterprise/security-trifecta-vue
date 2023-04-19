import { vi } from 'vitest';

export const useAuth = vi.fn().mockReturnValue({
  login: vi.fn().mockResolvedValue(false),
  logout: vi.fn().mockResolvedValue(undefined),
});
