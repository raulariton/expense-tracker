import { axiosPrivate } from '../api/axios';
import useRefreshToken from './useRefreshToken';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

/**
 * Custom hook to create an Axios instance with interceptors
 * to handle token refresh and authorization headers. This axios
 * instance is to be used for API routes that require authentication
 * (inclusion of the access token in the request headers).
 */
const useAxiosPrivate = () => {
  const { refresh } = useRefreshToken();
  const auth = useAuth();

  useEffect(() => {
    /**
     * interceptors act as middleware that allow for intercepting requests
     * and responses before they are handled by .then() or catch.
     */

    // request interceptor executes before the request is sent
    const requestIntercept = axiosPrivate.interceptors.request.use(
      config => {
        // if no access token is present, add it to the headers
        if (!config.headers['Authorization']) {
          config.headers['Authorization'] = `Bearer ${auth.accessToken}`;
        }

        return config;
      },
      (error) => {
        // default error handling behavior, which propagates to nearest catch
        return Promise.reject(error);
      }
    );

    // response interceptor executes after the response is received
    const responseIntercept = axiosPrivate.interceptors.response.use(
      response => response,
      async (error) => {

        // get previous request that failed
        const prevRequest = error?.config;

        // if the error is due to an expired token, refresh it
        if (error?.response?.status === 403 && !prevRequest.sent) {
          // mark request as sent to prevent infinite interception loop
          prevRequest.sent = true;

          // make request and get new access token
          const newAccessToken = await refresh();

          // update access token in the authentication context
          if (!newAccessToken) {
            // if refresh failed, reject the error
            // TODO: redirect user to login again
            return Promise.reject(error);
          }

          auth.login(newAccessToken);

          // add new access token to previous request
          prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

          return axiosPrivate(prevRequest);
        }

        // if the error is not due to an expired token, reject it
        return Promise.reject(error);
      }
    );

    return () => {
      // clean up interceptors when component unmounts
      // (i.e. no longer in use in DOM)
      // this is any component that contains makes use of useAxiosPrivate hook
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };

    /**
     * dependencies:
     * - auth: to update the hook when the access token changes
     * - refresh: to use the latest version of the refresh function
     * (as recommended by react hook rules)
     */
  }, [auth, refresh]);

  return axiosPrivate;
}

export default useAxiosPrivate;