import axios from "axios";
import baseUrl from "../../app.config";

// Using a function to treat the JWT as a computed property to make sure the localStorage lookup happens per request
export function getRequester() {
  const JWT = localStorage.getItem("adminToken");
  if (!JWT) {
    throw new Error("adminToken was not found in localStorage.");
  }

  const token = JSON.parse(JWT);
  const Authorization = `Bearer ${token.token}`;

  return axios.create({
    baseURL: baseUrl,
    headers: { Authorization },
  });
}

const getUserId = async (token: string) => {
  let response = { data: {}, error: null };
  try {
    response = await axios.get(
      `${baseUrl}/api/application/id-by-token/${token}`
    );
  } catch (error: any) {
    response.error = error;
  }

  return response;
};

export const isAuthenticated = () => {
  const JWT = localStorage.getItem("adminToken");
  let token = null;
  if (typeof JWT === "string") {
    token = JSON.parse(JWT);
  }

  if (token) {
    return getUserId(token?.token);
  }
  return null;
};

export function fileMultipart() {
  const JWT = localStorage.getItem("adminToken");
  if (!JWT) throw new Error("adminToken was not found in localStorage.");

  const token = JSON.parse(JWT);
  const Authorization = `Bearer ${token.token}`;
  return axios.create({
    baseURL: baseUrl,
    headers: { Authorization, "Content-Type": `multipart/form-data` },
  });
}
