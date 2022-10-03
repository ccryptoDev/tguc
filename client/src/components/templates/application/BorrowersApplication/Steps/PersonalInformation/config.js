import TextField from "../../../../../molecules/Form/Fields/TextField/Placeholder-label";
import FormattedField from "../../../../../molecules/Form/Fields/FormattedField/Placeholder-label";
import Password from "../../../../../molecules/Form/Fields/Password/Placeholder-label";
import Select from "../../../../../molecules/Form/Fields/Select/Default/Placeholder-label";
import { states } from "../../../select-options";

export const initForm = ({
  firstName = "",
  lastName = "",
  phone = "",
  dateOfBirth = "",
  ssnNumber = "",
  email = "",
}) => {
  return {
    firstName: { value: firstName, message: "", required: true },
    lastName: { value: lastName, message: "", required: true },
    phone: { value: phone, message: "", required: true },
    dateOfBirth: { value: dateOfBirth, message: "", required: true },
    ssnNumber: { value: ssnNumber, message: "", required: true },
    email: { value: email, message: "", required: true },
    password: { value: "", message: "", required: true },
    repassword: { value: "", message: "", required: true },
  };
};

const dontEditFields = ["password", "repassword"];

export const renderFields = (form, edit = false) =>
  [
    {
      value: form.firstName.value,
      name: "firstName",
      component: TextField,
      label: "First Name",
      placeholder: "First Name",
      message: form.firstName.message,
    },
    {
      value: form.lastName.value,
      name: "lastName",
      component: TextField,
      label: "Last Name",
      placeholder: "Last Name",
      message: form.lastName.message,
    },
    {
      value: form.phone.value,
      name: "phone",
      component: FormattedField,
      label: "Mobile Phone",
      mask: "_",
      format: "+1 (###) ### ####",
      placeholder: "+1 (###) ### ####",
      message: form.phone.message,
    },
    {
      value: form.ssnNumber.value,
      name: "ssnNumber",
      component: FormattedField,
      label: "Social Security Number - last 4 Digits",
      format: "####",
      placeholder: "Enter last 4 digits",
      message: form.ssnNumber.message,
    },
    {
      value: form?.dateOfBirth?.value,
      name: "dateOfBirth",
      label: "Birth Date",
      message: form.dateOfBirth?.message || "",
      mask: "_",
      format: "##/##/####",
      placeholder: "mm/dd/yyyy",
      component: FormattedField,
    },
    {
      value: form.email.value,
      name: "email",
      component: TextField,
      label: "Email",
      message: form.email.message,
    },
    {
      value: form.password.value,
      name: "password",
      component: Password,
      label: "Create Password",
      message: form.password.message,
    },
    {
      value: form.repassword.value,
      name: "repassword",
      component: Password,
      label: "Repeat Password",
      message: form.repassword.message,
    },
  ].filter((field) => !edit || !dontEditFields.includes(field.name));
