export default jest.fn().mockReturnValue({
  getDatabaseKey: jest.fn().mockResolvedValue(undefined),
});
