import TextField from "../../../molecules/Form/Fields/TextField";
import FormattedField from "../../../molecules/Form/Fields/FormattedField";
import { validateDob } from "../../../../utils/validators/dob";
import { validateEmail } from "../../../../utils/validators/email";

export const initPersonalInfoForm = ({
  firstName = "",
  lastName = "",
  phones = [],
  dateOfBirth = "",
  ssnNumber = "",
  email = "",
}) => {
  return {
    firstName: { value: firstName, message: "" },
    lastName: { value: lastName, message: "" },
    phone: { value: phones[0], message: "" },
    dateOfBirth: { value: dateOfBirth, message: "" },
    ssnNumber: { value: ssnNumber, message: "" },
    email: { value: email, message: "" },
  };
};

export const renderPersonalInfoFields = (form) => [
  {
    value: form.firstName.value,
    name: "firstName",
    component: TextField,
    placeholder: "First Name",
    message: form.firstName.message,
  },
  {
    value: form.lastName.value,
    name: "lastName",
    component: TextField,
    placeholder: "Last Name",
    message: form.lastName.message,
  },
  {
    value: form.phone.value,
    name: "phone",
    component: FormattedField,
    placeholder: "Mobile Phone",
    mask: "_",
    format: "+1 (###) ### ####",
    message: form.phone.message,
  },
  {
    value: form.ssnNumber.value,
    name: "ssnNumber",
    component: FormattedField,
    placeholder: "Social Security Number",
    mask: "_",
    format: "####",
    message: form.ssnNumber.message,
  },
  {
    value: form?.dateOfBirth?.value,
    name: "dateOfBirth",
    placeholder: "Birth Date",
    message: form.dateOfBirth?.message || "",
    mask: "_",
    format: "##/##/####",
    component: FormattedField,
  },
  {
    value: form.email.value,
    name: "email",
    component: TextField,
    placeholder: "Enter your Email",
    message: form.email.message,
  },
];

export const validatePIForm = (form) => {
  const newForm = { ...form };
  let isValid = true;
  Object.keys(newForm).forEach((key) => {
    if (key === "dob") {
      const message = validateDob(newForm.dob.value);
      if (message) {
        isValid = false;
        newForm.dob.message = message;
      }
    } else if (
      key === "phone" &&
      newForm.phone.value.replace("_", "").replace("+", "").trim().length !== 10
    ) {
      isValid = false;
      newForm.phone.message = "enter a valid phone number";
    } else if (key === "email") {
      const emailIsValid = validateEmail(newForm.email.value);
      if (!emailIsValid) {
        newForm.email.message = "enter a valid email";
        isValid = false;
      }
    } else if (
      key === "ssn" &&
      newForm.ssn.value.trim().replace("_", "").length !== 9
    ) {
      isValid = false;
      newForm.ssn.message = "enter a valid number";
    } else if (
      key === "firstName" &&
      newForm.firstName.value.trim().length < 1
    ) {
      newForm.firstName.message = "this field is required";
      isValid = false;
    } else if (key === "lastName" && newForm.lastName.value.trim().length < 1) {
      newForm.lastName.message = "this field is required";
      isValid = false;
    }
  });

  return [isValid, newForm];
};
