import TextField from "../../../../molecules/Form/Fields/TextField/Placeholder-label";
import Password from "../../../../molecules/Form/Fields/Password/Placeholder-label";
import FormattedInput from "../../../../molecules/Form/Fields/FormattedField/Placeholder-label";

export const initialForm = (state) => {
  return {
    financeAmount: {
      value: 5000,
      message: "",
      required: true,
    },
  };
};

export const fields = (form) => [];

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
