import { emailRegexp } from "../regexp";

export const validateEmail = (email) => {
  const emailValid = emailRegexp.test(String(email).toLowerCase());
  return [emailValid, email];
};
