import { validateEmail } from "../../../../../../utils/validators/email";
import { validateUrl } from "../../../../../../utils/validators/url";
import {
  validateTIN,
  validatePhone,
  validateZipCode,
} from "../../../../../../utils/validators/other";

export const validateForm = (form) => {
  const newForm = { ...form };
  let isValid = true;
  Object.keys(newForm).forEach((key) => {
    if (newForm[key].required) {
      if (key === "phone") {
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
      } else if (key === "tin") {
        const message = validateTIN(newForm[key].value);
        if (message) {
          isValid = false;
          newForm[key].message = message;
        }
      } else if (key === "website") {
        const urlIsValid = validateUrl(newForm[key].value);
        if (!urlIsValid) {
          isValid = false;
          newForm[key].message = "Enter a valid url";
        }
      } else if (key === "zip") {
        const message = validateZipCode(newForm.zip.value.trim());
        if (message) {
          isValid = false;
          newForm.zip.message = message;
        }
      } else if (newForm[key].value.trim().length < 1) {
        isValid = false;
        newForm[key].message = "This field is required";
      }
    }
  });
  return [isValid, newForm];
};

export const validateFiles = (form) => {
  const updatedForm = { ...form };
  let isValid = true;
  Object.keys(updatedForm).forEach((key) => {
    const uploadedNumberOfDocuments = updatedForm[key].value.length;
    const requiredNumberOfDocuments = updatedForm[key].limit;
    const isRequired = updatedForm[key].required;
    if (isRequired && uploadedNumberOfDocuments !== requiredNumberOfDocuments) {
      isValid = false;
      updatedForm[
        key
      ].message = `documents missing (${uploadedNumberOfDocuments}/${requiredNumberOfDocuments})`;
    }
  });

  return [isValid, updatedForm];
};
