export const useAuth = jest.fn().mockReturnValue({
  login: jest.fn().mockResolvedValue(false),
  logout: jest.fn().mockResolvedValue(undefined),
});
