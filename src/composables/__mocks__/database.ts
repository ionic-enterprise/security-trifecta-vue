export const useDatabase = jest.fn().mockReturnValue({
  getHandle: jest.fn().mockResolvedValue(undefined),
});
