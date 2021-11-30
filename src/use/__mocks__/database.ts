export default jest.fn().mockReturnValue({
  addTastingNote: jest.fn().mockResolvedValue(undefined),
  deleteTastingNote: jest.fn().mockResolvedValue(undefined),
  updateTastingNote: jest.fn().mockResolvedValue(undefined),
  resetTastingNotes: jest.fn().mockResolvedValue(undefined),
  trimTastingNotes: jest.fn().mockResolvedValue(undefined),
  getTastingNotes: jest.fn().mockResolvedValue([]),
  getTeaCategories: jest.fn().mockResolvedValue([]),
  mergeTastingNote: jest.fn().mockResolvedValue(undefined),
  mergeTeaCategory: jest.fn().mockResolvedValue(undefined),
});
