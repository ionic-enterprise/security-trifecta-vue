export default jest.fn().mockReturnValue({
  login: jest.fn().mockResolvedValue(false),
  logout: jest.fn().mockResolvedValue(undefined),
});
