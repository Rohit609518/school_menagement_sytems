import { createContext, useContext, useEffect, useState } from "react";

export const BACKEND_URL = "https://school-menagement-sytems.onrender.com";
export const API_URL = import.meta.env.VITE_API_URL || `${BACKEND_URL}/api`;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [familyAccounts, setFamilyAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem("family_accounts");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    // If it's Student or Parent, cache in family accounts for 1-click shared mobile switching
    if (userData?.role === "Student" || userData?.role === "Parent") {
      const key = userData.role.toLowerCase();
      setFamilyAccounts((prev) => {
        const updated = {
          ...prev,
          [key]: { user: userData, token },
        };
        localStorage.setItem("family_accounts", JSON.stringify(updated));
        return updated;
      });
    }
  };

  // 1-Click switch between Student and Parent on a shared family mobile
  const switchFamilyRole = (targetRole) => {
    const key = targetRole.toLowerCase();
    const target = familyAccounts[key];
    if (target && target.token && target.user) {
      localStorage.setItem("token", target.token);
      localStorage.setItem("user", JSON.stringify(target.user));
      setUser(target.user);
      return true;
    }
    return false;
  };

  // One-time linking of family companion account
  const linkFamilyMember = (role, userData, token) => {
    const key = role.toLowerCase();
    setFamilyAccounts((prev) => {
      const updated = {
        ...prev,
        [key]: { user: userData, token },
      };
      localStorage.setItem("family_accounts", JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const clearAllFamily = () => {
    localStorage.removeItem("family_accounts");
    setFamilyAccounts({});
    logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        familyAccounts,
        switchFamilyRole,
        linkFamilyMember,
        clearAllFamily,
        loading,
        apiUrl: API_URL,
        backendUrl: BACKEND_URL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};