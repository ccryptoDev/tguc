import {
  validateZipCode,
  validateLoanAmount,
} from "../../../../../../utils/validators/other";

export const validateForm = (form) => {
  const newForm = { ...form };
  let isValid = true;
  Object.keys(newForm).forEach((key) => {
    if (newForm[key].required) {
      if (key === "zip") {
        const message = validateZipCode(newForm.zip.value.trim());
        if (message) {
          isValid = false;
          newForm.zip.message = message;
        }
      } else if (key === "requestedAmount") {
        const message = validateLoanAmount(
          newForm[key].value,
          newForm.state.value
        );
        if (message) {
          isValid = false;
          newForm[key].message = message;
        } else {
          newForm[key].message = "";
        }
      } else if (newForm[key].value.trim().length < 1) {
        isValid = false;
        newForm[key].message = "This field is required";
      }
    }
  });
  return [isValid, newForm];
};
