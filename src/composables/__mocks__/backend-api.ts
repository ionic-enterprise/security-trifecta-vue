export const useBackendAPI = jest.fn().mockReturnValue({
  client: {
    delete: jest.fn().mockResolvedValue({ data: null }),
    get: jest.fn().mockResolvedValue({ data: null }),
    post: jest.fn().mockResolvedValue({ data: null }),
  },
});
