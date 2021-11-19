export default jest.fn().mockReturnValue({
  getTastingNotes: jest.fn().mockResolvedValue([]),
  getTeaCategories: jest.fn().mockResolvedValue([]),
  mergeTastingNote: jest.fn().mockResolvedValue(undefined),
  mergeTeaCategory: jest.fn().mockResolvedValue(undefined),
});
