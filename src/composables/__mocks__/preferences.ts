import { vi } from 'vitest';
import { ref } from 'vue';

export const usePreferences = vi.fn().mockReturnValue({
  load: vi.fn().mockResolvedValue(undefined),
  prefersDarkMode: ref(false),
});
