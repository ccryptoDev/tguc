import { validateEmail } from "../../../../../utils/validators/email";

export const validateForm = (form) => {
  const newForm = { ...form };
  let isValid = true;
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

  newForm.email = { ...newForm.email.value };
  if (isValid) {
    // PARSE FORM TO REQUEST BODY FORMAT
    Object.keys(newForm).forEach((item) => {
      newForm[item] = newForm[item].value;
    });
    delete newForm.repassword;
  }
  return [isValid, newForm];
};
