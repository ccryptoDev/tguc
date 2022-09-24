import TextField from "../../../../../../molecules/Form/Fields/TextField/Placeholder-label";
import FormattedField from "../../../../../../molecules/Form/Fields/FormattedField/Placeholder-label";
import Select from "../../../../../../molecules/Form/Fields/Select/Default/Placeholder-label";
import { states } from "../../../../select-options";

export const accountTypes = {
  SAVING: "SAVING",
  CHECKING: "CHECKING",
};

export const initForm = () => {
  return {
    cardNumber: { value: "", message: "" },
    fullName: { value: "", message: "" },
    expirationDate: { value: "", message: "" },
    securityCode: { value: "", message: "" },
    firstName: { value: "", message: "" },
    lastName: { value: "", message: "" },
    street: { value: "", message: "" },
    city: { value: "", message: "" },
    state: { value: "", message: "" },
    zipCode: { value: "", message: "" },
    routingNumber: { value: "", message: "" },
    accountNumber: { value: "", message: "" },
    reaccountNumber: { value: "", message: "" },
    financialInstitution: { value: "", message: "" },
    accountType: { value: accountTypes.SAVING, message: "" },
    manualPayment: { value: false, message: "" },
  };
};

export const renderBillingAddress = (form) => [
  {
    value: form.firstName.value,
    name: "firstName",
    component: TextField,
    label: "First Name",
    message: form.firstName.message,
  },
  {
    value: form.lastName.value,
    name: "lastName",
    component: TextField,
    label: "Last Name",
    message: form.lastName.message,
  },
  {
    value: form.street.value,
    name: "street",
    component: TextField,
    label: "Street",
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
    options: states,
    label: "State",
    message: form.state.message,
  },
  {
    value: form.zipCode.value,
    name: "zipCode",
    component: TextField,
    label: "Zip Code",
    message: form.zipCode.message,
  },
];
