export const useTastingNotesAPI = jest.fn().mockReturnValue({
  getAll: jest.fn().mockResolvedValue([]),
  save: jest.fn().mockResolvedValue(undefined),
  remove: jest.fn().mockResolvedValue(undefined),
});
