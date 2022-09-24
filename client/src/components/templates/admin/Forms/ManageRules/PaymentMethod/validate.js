import {
  validateAccountNumber,
  validateRoutingNumber,
} from "../../../../../../utils/validators/other";

export const validateForm = (form) => {
  const newForm = { ...form };
  let isValid = true;
  Object.keys(newForm).forEach((key) => {
    if (newForm[key].required) {
      if (key === "accountNumber") {
        const message = validateAccountNumber(newForm[key].value);
        if (message) {
          isValid = false;
          newForm[key].message = message;
        }
      } else if (
        key === "reaccountNumber" &&
        newForm[key].value.trim() !== newForm.accountNumber.value
      ) {
        isValid = false;
        newForm[key].message = "account numbers should match";
      } else if (key === "routingNumber") {
        const message = validateRoutingNumber(newForm[key].value);
        if (message) {
          isValid = false;
          newForm[key].message = message;
        }
      } else if (newForm[key].value.trim().length < 1) {
        isValid = false;
        newForm[key].message = "This field is required";
      }
    }
  });
  return [isValid, newForm];
};
