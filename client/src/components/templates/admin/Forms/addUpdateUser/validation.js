import { validateEmail } from "../../../../../utils/validators/email";
import { validatePassword } from "../../../../../utils/validators/password";

export const validateForm = (form) => {
  const newForm = { ...form };
  let isValid = true;
  if (newForm.password.required) {
    const [passwordValid, password, repassword] = validatePassword({
      password: newForm.password.value,
      repassword: newForm.repassword.value,
    });
    newForm.password = newForm.password.value;
    newForm.repassword = newForm.repassword.value;
    if (!passwordValid) {
      isValid = false;
    }
  }
  const [emailValid, email] = validateEmail(newForm.email.value);
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
    // PARSE FORM TO REQUEST BODY FORMAT
    Object.keys(newForm).forEach((item) => {
      newForm[item] = newForm[item].value;
    });
    delete newForm.repassword;
  }
  return [isValid, newForm];
};
