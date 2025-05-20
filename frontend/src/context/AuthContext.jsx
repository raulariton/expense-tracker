import React, { useState, createContext, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext({
  userEmail: null,
  userID: null,
  userRole: null,
  isAuthenticated: false,
})

export const AuthProvider = ({ children }) => {
  const [userEmail, setUserEmail] = useState(null);
  const [userID, setUserID] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    login();
  }, []);

  const login = () => {
      const token = localStorage.getItem("access_token");

      if (token) {
        try {
          const decodedToken = jwtDecode(token);

          setUserEmail(decodedToken.sub);
          setUserID(decodedToken.user_id);
          setUserRole(decodedToken.role);
          setIsAuthenticated(true);
        } catch (error) {
          // TODO: what should happen in this case?
          console.error("Error decoding token:", error);
          logout();
        }
      }
    }

  const logout = () => {
    localStorage.removeItem("access_token");
    setUserEmail(null);
    setUserID(null);
    setUserRole(null);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider
      value={{
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