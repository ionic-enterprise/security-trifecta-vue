export const useStorage = jest.fn().mockReturnValue({
  getValue: jest.fn().mockResolvedValue(undefined),
  setValue: jest.fn().mockResolvedValue(undefined),
});
