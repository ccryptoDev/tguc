import TextField from "../../../../molecules/Form/Fields/TextField/Placeholder-label";
import Password from "../../../../molecules/Form/Fields/Password/Placeholder-label";
import { validatePassword } from "../../../../../utils/validators/password";
import { validateEmail } from "../../../../../utils/validators/email";

export const initLoginForm = () => {
  return {
    email: { value: "", message: "" },
    password: { value: "", message: "" },
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

export const validate = (form: any) => {
  const newForm = { ...form };
  let isValid = true;

  Object.keys(newForm).forEach((key) => {
    if (key === "password") {
      const [isPasswordValid, passwordMessage] = validatePassword({
        password: newForm[key].value,
      });

      if (!isPasswordValid) {
        isValid = false;
        newForm.password.message = passwordMessage;
      }
    } else if (key === "email") {
      const emailIsValid = validateEmail(newForm.email.value);
      if (!emailIsValid) {
        newForm.email.message = "Enter a valid email";
        isValid = false;
      }
    }
  });
  return [isValid, newForm];
};
