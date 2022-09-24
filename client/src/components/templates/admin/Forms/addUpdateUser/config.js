import TextField from "../../../../molecules/Form/Fields/TextField/Placeholder-label";
import Password from "../../../../molecules/Form/Fields/Password/Placeholder-label";
import FormattedInput from "../../../../molecules/Form/Fields/FormattedField/Placeholder-label";

export const initialForm = (state) => {
  return {
    userName: {
      value: state?.userName ? state?.userName : "",
      message: "",
      required: true,
    },
    email: {
      value: state?.email ? state.email : "",
      message: "",
      required: true,
    },
    phoneNumber: {
      value: state?.phoneNumber ? state?.phoneNumber : "",
      message: "",
      required: true,
    },
    password: { value: "", valid: false, required: true, message: "" },
    repassword: { value: "", message: "", required: true },
  };
};

export const fields = (form) => [
  {
    value: form.userName?.value || "",
    placeholder: "Enter your full name",
    label: "Name",
    message: form.userName?.message || "",
    name: "userName",
    component: TextField,
  },
  {
    value: form.email?.value || "",
    placeholder: "Enter your email",
    label: "Email",
    message: form.email?.message || "",
    name: "email",
    component: TextField,
  },
  {
    value: form?.phoneNumber?.value,
    name: "phoneNumber",
    placeholder: "+1 (***) *** ****",
    message: form?.phoneNumber?.message || "",
    component: FormattedInput,
    valid: form?.phoneNumber?.valid || false,
    format: "+1 (###) ### ####",
    label: "Phone number",
    mask: "_",
  },
];

export const passwordFields = (form) => [
  {
    value: form?.password?.value || "",
    name: "password",
    placeholder: "Password",
    message: form?.password?.message || "",
    component: Password,
    type: "password",
    valid: form?.password?.valid,
    label: "Password",
  },
  {
    value: form.repassword?.value || "",
    placeholder: "Repeat password",
    label: "Repeat password",
    message: form.repassword?.message || "",
    name: "repassword",
    component: Password,
  },
];
