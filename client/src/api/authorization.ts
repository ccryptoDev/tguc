import axios from "axios";
import baseUrl from "../app.config";
import { IResponse, IPersonalInfoApi } from "./types";
import { fetchUser } from "./requester";

// LOGIN API
export const login = async (credentials: {
  email: string;
  password: string;
}) => {
  let result = { error: null };
  try {
    const { data, status } = await axios.post(
      `${baseUrl}/api/application/login`,
      {
        email: credentials?.email,
        password: credentials?.password,
      }
    );

    if (status !== 201) {
      throw new Error("Something went wrong, please try again later");
    }
    result = data;
    if (data && data.token) {
      const { email, id, practiceManagement, role, token, userName } = data;
      localStorage.setItem(
        "userToken",
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
  } catch (error: any) {
    if (error.message.includes("401")) {
      return { error: { message: "Incorrect email or password" } };
    }

    return { error: { message: "server error" } };
  }

  return result;
};

// LOGOUT FUNCTION
export const logout = (cb: Function): void => {
  localStorage.removeItem("userToken");
  if (localStorage.getItem("userToken")) {
    window.location.reload();
  }
  if (typeof cb === "function") {
    cb();
  }
};

export async function registerUser(payload: IPersonalInfoApi) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await axios.post(`${baseUrl}/application/saveUserInfo`, payload);
  } catch (error: any) {
    response.error = error;
  }
  return response;
}

export const RegisterBorrowerAccount = async (body: IPersonalInfoApi) => {
  const result = await registerUser(body); // create user
  if (result && !result.error && body.email && body.password) {
    const res = await login({ email: body.email, password: body.password }); // set token
    if (res && !res.error) {
      const isAuthorized = await fetchUser(); // fetch token and get
      return isAuthorized;
    }

    return res;
  }
  return result;
};

export const emailExists = async (email: string) => {
  let response: IResponse = { data: null, error: null };
  try {
    response = await axios.post(`${baseUrl}/user/emailExists`, { email });
  } catch (error: any) {
    response.error = error;
  }
  return response.data;
};
