export const useTeaCategoriesDatabase = jest.fn().mockReturnValue({
  getAll: jest.fn().mockResolvedValue([]),
  trim: jest.fn().mockResolvedValue(undefined),
  upsert: jest.fn().mockResolvedValue(undefined),
});
