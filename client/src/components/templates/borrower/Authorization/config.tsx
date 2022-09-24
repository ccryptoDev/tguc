import TextField from "../../../molecules/Form/Fields/TextField/Placeholder-label";
import FormattedField from "../../../molecules/Form/Fields/FormattedField/Placeholder-label";
import Password from "../../../molecules/Form/Fields/Password/Placeholder-label";
import { IForgotPasswordForm, IRegisterForm } from "./types";

export const initLoginForm = () => {
  return {
    email: { value: "", message: "" },
    password: { value: "", message: "" },
  };
};

export const initRestorePasswordForm = () => {
  return {
    email: { value: "", message: "" },
  };
};

export const renderLoginFormFields = (form: any) => [
  {
    value: form?.email?.value || "",
    name: "email",
    label: "Email Address",
    message: form.email?.message || "",
    component: TextField,
  },
  {
    value: form?.password?.value || "",
    name: "password",
    label: "Password",
    message: form?.password?.message || "",
    component: Password,
    type: "password",
    valid: form?.password?.valid,
  },
];

export const renderRegisterFormFields = (form: IRegisterForm) => [
  {
    value: form?.email?.value || "",
    name: "email",
    label: "Email Address",
    message: form.email?.message || "",
    component: TextField,
  },
  {
    value: form?.password?.value || "",
    name: "password",
    label: "Create Password",
    message: form?.password?.message || "",
    component: Password,
    type: "password",
  },
  {
    value: form?.repassword?.value || "",
    name: "repassword",
    label: "Confirm Password",
    message: form?.password?.message || "",
    component: Password,
    type: "password",
  },
];

export const renderEmailField = (form: IForgotPasswordForm) => [
  {
    value: form?.email?.value || "",
    name: "email",
    label: "Email Address",
    message: form.email?.message || "",
    component: TextField,
  },
];
