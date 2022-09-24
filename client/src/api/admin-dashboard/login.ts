import axios from "axios";
import baseUrl from "../../app.config";

// LOGIN API
export const adminLogin = async (credentials: {
  email: string;
  password: string;
}) => {
  let result = {};
  try {
    const { data, status } = await axios.post(`${baseUrl}/api/admin/login`, {
      email: credentials?.email,
      password: credentials?.password,
    });

    if (status !== 201) {
      throw new Error("Something went wrong, please try again later");
    }
    result = data;
    if (data && data.token) {
      const { email, id, practiceManagement, role, token, userName } = data;
      localStorage.setItem(
        "adminToken",
        JSON.stringify({
          email,
          id,
          practiceManagement,
          role,
          token,
          userName,
        })
      );
    }
  } catch (error) {
    if (error.message.includes("401")) {
      return { error: { message: "Incorrect email or password" } };
    }

    return { error: { message: "server error" } };
  }

  return result;
};

// LOGOUT FUNCTION
export const logout = () => {
  localStorage.removeItem("adminToken");
  if (localStorage.getItem("adminToken")) {
    window.location.reload();
  }
};

export async function forgotPassword(email: string, isContractor = true) {
  let response = { data: null, error: null };
  try {
    response = await axios.post(`${baseUrl}/api/application/forgotPassword`, {
      email,
      isContractor,
    });
  } catch (error) {
    response.error = error;
  }
  return response;
}
