import { validateEmail } from "../../../../../utils/validators/email";
import { validatePassword } from "../../../../../utils/validators/password";

export const validateForm = (form) => {
  const newForm = { ...form };
  let isValid = true;

  // VALIDATE PASSWORD
  if (newForm.password.required) {
    const password = newForm.password.value;
    const repassword = newForm.repassword.value;
    const [passwordValid, passwordMessage, repasswordMessage] =
      validatePassword({
        password,
        repassword,
      });

    if (!passwordValid) {
      isValid = false;
      newForm.password.message = passwordMessage;
      newForm.repassword.message = repasswordMessage;
    }
  }

  // VALIDATE EMAIL
  const emailValid = validateEmail(newForm.email.value);
  if (!emailValid) {
    newForm.email.message = "Enter a valid email";
    isValid = false;
  }

  Object.keys(newForm).forEach((key) => {
    if (
      newForm[key].required &&
      !newForm[key].value &&
      key !== "email" &&
      key !== "password" &&
      key !== "repassword"
    ) {
      newForm[key].message = "this field is required";
      isValid = false;
    }
  });

  if (isValid) {
    delete newForm.repassword;
    if (!newForm.password.required) delete newForm.password;
  }
  return [isValid, newForm];
};
