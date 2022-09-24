import TextField from "../../../../molecules/Form/Fields/TextField/Placeholder-label";
import Password from "../../../../molecules/Form/Fields/Password/Placeholder-label";
import FormattedInput from "../../../../molecules/Form/Fields/FormattedField/Placeholder-label";

export const initialForm = (state) => {
  return {
    userName: {
      value: state?.userName ? state?.userName : 0,
      message: "",
      required: true,
    },
    downPayment: {
      value: Number(state?.userName) - Number(state?.financeAmount),
      message: "",
      required: true,
    },
    financeAmount: {
      value: 5000,
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
    placeholder: "Project Cost",
    label: "Project Cost",
    message: form.userName?.message || "",
    name: "userName",
    component: TextField,
  },
  {
    value: form.financeAmount.value || "",
    placeholder: "Finance Amount",
    label: "Finance Amount",
    message: form.userName?.message || "",
    name: "userName",
    component: TextField,
  },
  {
    value: form.downPayment?.value || "",
    placeholder: "Cash Down",
    label: "Cash Down",
    message: form.userName?.message || "",
    name: "userName",
    component: TextField,
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
