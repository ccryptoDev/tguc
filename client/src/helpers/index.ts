// TO BE REMOVED ?

export const getAdminRoles = () => {
  return {
    Manager: "Manager",
    Merchant: "Merchant",
    SuperAdmin: "Super Admin",
    MerchantStaff: "Merchant Staff",
  };
};

export const getAdminData = (): {
  email: string;
  id: string;
  practiceManagement: string;
  role: string;
  userName: string;
} | null => {
  try {
    const adminToken = JSON.parse(localStorage.getItem("adminToken") || "");
    if (adminToken) {
      return {
        email: adminToken.email,
        id: adminToken.id,
        practiceManagement: adminToken.practiceManagement,
        role: adminToken.role,
        userName: adminToken.userName,
      };
    }
    return null;
  } catch (error) {
    return null;
  }
};
