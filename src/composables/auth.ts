import { useBackendAPI } from './backend-api';
import { useSessionVault } from './session-vault';

const { client } = useBackendAPI();
const { clearSession, setSession } = useSessionVault();

const login = async (email: string, password: string): Promise<boolean> => {
  const response = await client.post('/login', { username: email, password });
  if (response.data.success) {
    await setSession({
      user: response.data.user,
      token: response.data.token,
    });
    return true;
  }
  return false;
};

const logout = async (): Promise<void> => {
  await client.post('/logout');
  await clearSession();
};

export const useAuth = () => {
  return {
    login,
    logout,
  };
};
