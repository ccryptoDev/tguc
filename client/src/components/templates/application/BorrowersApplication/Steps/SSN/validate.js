import { validateSSN } from "../../../../../../utils/validators/other";

export const validateForm = (form) => {
  const newForm = { ...form };
  let isValid = true;
  Object.keys(newForm).forEach((key) => {
    if (newForm[key].required) {
      if (key === "ssn") {
        const message = validateSSN(newForm.ssn.value.trim());
        if (message) {
          isValid = false;
          newForm.ssn.message = message;
        }
      }
    }
  });
  return [isValid, newForm];
};
