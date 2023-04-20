import { vi } from 'vitest';

export const useAuth = vi.fn().mockReturnValue({
  isAuthenticated: vi.fn().mockResolvedValue(false),
  getAccessToken: vi.fn().mockResolvedValue(undefined),
  getUserEmail: vi.fn().mockResolvedValue(undefined),
  login: vi.fn().mockResolvedValue(false),
  logout: vi.fn().mockResolvedValue(undefined),
});
