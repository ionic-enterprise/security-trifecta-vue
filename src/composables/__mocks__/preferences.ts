import { ref } from 'vue';

export const usePreferences = jest.fn().mockReturnValue({
  load: jest.fn().mockResolvedValue(undefined),
  prefersDarkMode: ref(false),
});
