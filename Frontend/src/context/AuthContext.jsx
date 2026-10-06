import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContextInstance";

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    try {
      const data = localStorage.getItem("auth");
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      localStorage.removeItem("auth");
      return null;
    }
  });

  const isAuthenticated = Boolean(auth?.token);

  useEffect(() => {
    try {
      if (auth) {
        localStorage.setItem("auth", JSON.stringify(auth));
      } else {
        localStorage.removeItem("auth");
      }
    } catch (err) {
      console.error("Failed to sync auth to localStorage:", err);
    }
  }, [auth]);

  const login = (newAuth) => {
    setAuth(newAuth);
  };

  const logout = () => {
    setAuth(null);
  };

  const updateUser = (updatedUserData) => {
    setAuth((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        user: {
          ...prev.user,
          ...updatedUserData,
        },
      };
    });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, updateUser, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

