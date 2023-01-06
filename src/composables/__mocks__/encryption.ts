export const useEncryption = jest.fn().mockReturnValue({
  getDatabaseKey: jest.fn().mockResolvedValue(undefined),
});
