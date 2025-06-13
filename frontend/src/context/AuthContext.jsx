import React, { useState, createContext, useContext } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext({
  accessToken: null,
  userEmail: null,
  userID: null,
  userRole: null,
  isAuthenticated: false,
})

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userID, setUserID] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Update authentication state based on the provided access token.
   * @param access_token
   */
  const login = (access_token) => {
    // set in-memory state
    setAccessToken(access_token);

    // DEBUG
    console.log("Access token set:", access_token);

    // decode token to obtain user information
    try {
      const decodedToken = jwtDecode(access_token);

      setUserEmail(decodedToken.sub);
      setUserID(decodedToken.user_id);
      setUserRole(decodedToken.role);
      setIsAuthenticated(true);

    } catch (error) {
      // TODO: what should happen in this case?
      alert("Error decoding token:" + error);
      logout();
    }
  }

  const logout = () => {
    setAccessToken(null);
    setUserEmail(null);
    setUserID(null);
    setUserRole(null);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        userEmail,
        userID,
        userRole,
        isAuthenticated,
        login,
        logout
      }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext);

export default AuthContext;