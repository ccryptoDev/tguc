import TextField from "../../../../../molecules/Form/Fields/TextField/Placeholder-label";
import FormattedField from "../../../../../molecules/Form/Fields/FormattedField/Placeholder-label";
import Password from "../../../../../molecules/Form/Fields/Password/Placeholder-label";
import Select from "../../../../../molecules/Form/Fields/Select/Default/Placeholder-label";
import { states as statesOptions } from "../../../select-options";

export const initForm = ({
  firstName = "",
  middleName = "",
  lastName = "",
  phone = "",
  dateOfBirth = "",
  ssnNumber = "",
  street = "",
  city = "",
  unit = "",
  state = "",
  zipCode = "",
  email = "",
}) => {
  return {
    firstName: { value: firstName || "", message: "", required: true },
    middleName: { value: middleName || "", message: "", required: false },
    lastName: { value: lastName || "", message: "", required: true },
    phone: { value: phone || "", message: "", required: true },
    dateOfBirth: { value: dateOfBirth || "", message: "", required: true },
    ssnNumber: { value: ssnNumber || "", message: "", required: true },
    street: { value: street || "", message: "", required: true },
    city: { value: city || "", message: "", required: true },
    unit: { value: unit || "", message: "", required: false },
    state: { value: state || "", message: "", required: true },
    zipCode: { value: zipCode || "", message: "", required: true },
    email: { value: email || "", message: "", required: true },
    password: { value: "", message: "", required: true },
    repassword: { value: "", message: "", required: true },
  };
};

export const initFilesForm = () => {
  return {
    driversLicense: { value: [], message: "", required: true, limit: 2 },
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
      value: form.middleName.value,
      name: "middleName",
      component: TextField,
      label: "Middle Name",
      placeholder: "Middle Name",
      message: form.middleName.message,
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
      label: "Social Security Number",
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
      value: form.street.value,
      name: "street",
      component: TextField,
      label: "Street Address",
      message: form.street.message,
    },
    {
      value: form.city.value,
      name: "city",
      component: TextField,
      label: "City",
      message: form.city.message,
    },
    {
      value: form.state.value,
      name: "state",
      component: Select,
      options: statesOptions,
      label: "State",
      message: form.state.message,
    },
    {
      value: form.zipCode.value,
      name: "zipCode",
      component: FormattedField,
      label: "Zip Code",
      format: "#####",
      placeholder: "Enter zip code",
      message: form.zipCode.message,
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
