import { validatePassword } from "../../../../../../utils/validators/password";
import { validateDob } from "../../../../../../utils/validators/dob";
import { validateEmail } from "../../../../../../utils/validators/email";
import {
  validatePhone,
  validateZipCode,
  validateSSNLastFour,
} from "../../../../../../utils/validators/other";

export const validateForm = (form) => {
  const newForm = { ...form };
  let isValid = true;
  Object.keys(newForm).forEach((key) => {
    if (newForm[key].required) {
      if (key === "password") {
        const [isPasswordValid, passwordMessage, repasswordMessage] =
          validatePassword({
            password: newForm[key].value,
            repassword: newForm.repassword.value,
          });

        if (!isPasswordValid) {
          isValid = false;
          newForm.password.message = passwordMessage;
          newForm.repassword.message = repasswordMessage;
        }
      } else if (key === "dateOfBirth") {
        const message = validateDob(newForm.dateOfBirth.value);
        if (message) {
          isValid = false;
          newForm.dateOfBirth.message = message;
        }
      } else if (key === "phone") {
        const message = validatePhone(newForm[key].value);
        if (message) {
          isValid = false;
          newForm.phone.message = message;
        }
      } else if (key === "email") {
        const emailIsValid = validateEmail(newForm.email.value);
        if (!emailIsValid) {
          newForm.email.message = "Enter a valid email";
          isValid = false;
        }
      } else if (key === "zipCode") {
        const message = validateZipCode(newForm.zipCode.value.trim());
        if (message) {
          isValid = false;
          newForm.zipCode.message = message;
        }
      } else if (key === "ssnNumber") {
        const message = validateSSNLastFour(newForm.ssnNumber.value.trim());
        if (message) {
          isValid = false;
          newForm.ssnNumber.message = message;
        }
      } else if (newForm[key].value.trim().length < 1) {
        isValid = false;
        newForm[key].message = "This field is required";
      }
    }
  });
  return [isValid, newForm];
};

export const validateDriversLicense = (files) => {
  if (!files.frontSide) {
    return true;
  }

  if (!files.backSide) {
    return true;
  }

  return false;
};
