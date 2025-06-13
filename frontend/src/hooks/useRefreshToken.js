import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const useRefreshToken = () => {
  const { login } = useAuth();

  const refresh = async () => {
    // withCredentials is set to true to
    // allow cookies (where the refresh token is stored)
    // to be sent with the request
    const response = await axios.get(
      '/auth/refresh',
      {
        withCredentials: true,
      });

    // update the auth context with the new access token
    console.log("New access token received:", response.data.access_token);
    login(response.data.access_token);
  }

  return { refresh };
}

export default useRefreshToken;
