/* eslint no-underscore-dangle:0 */
import React, { useState, useEffect } from "react";
import { fetchUser, isJWT } from "../api/requester";
import { getLoanData } from "../utils/parseLoanData";

export const UserContext = React.createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({ isAuthorized: false, data: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); //  useState({ message: '' });

  // FETCH USER AUTH
  async function fetchUserData() {
    const result = await fetchUser();
    if (
      result &&
      result?.data &&
      typeof result?.data === "object" &&
      !result?.error
    ) {
      const {
        paymentManagements,
        screenTrackings,
        practiceManagements,
        ...userData
      } = result?.data;
      // EXTRACTING LOAN DATA
      const loanData = getLoanData({
        paymentManagements,
        screenTrackings,
        practiceManagements,
      });

      setUser((prevState) => ({
        ...prevState,
        data: {
          ...prevState.data,
          id: result?.data?.id,
          ...loanData,
          ...userData,
          doc: result?.data?._doc || {},
          employments: result?.data?.employments || {},
        },
        isAuthorized: true,
      }));
      setLoading(false);
      return loanData;
    }
    setError({ message: "server error" });
    setUser({ data: null, isAuthorized: false });
    setLoading(false);
    return null;
  }

  const logout = (cb) => {
    localStorage.removeItem("userToken");
    if (localStorage.getItem("userToken")) {
      window.location.reload();
    }
    if (typeof cb === "function") {
      setUser({ data: null, isAuthorized: false });
    }
    if (cb) cb();
  };

  // INIT
  useEffect(() => {
    if (isJWT()) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const expose = {
    user,
    loading,
    error,
    isAuthorized: user?.isAuthorized,
    lastScreen: user?.data?.screenTracking?.lastScreen || "",
    screenTrackingId: user?.data?.screenTracking?.id,
    userId: user?.data?.userId,
    setUser,
    logout,
    setLoading,
    setError,
    fetchUser: fetchUserData,
  };
  return <UserContext.Provider value={expose}>{children}</UserContext.Provider>;
};

export const useUserData = () => {
  const context = React.useContext(UserContext);

  if (context === undefined) {
    throw new Error("component must be used within a UserProvider");
  }
  return context;
};
