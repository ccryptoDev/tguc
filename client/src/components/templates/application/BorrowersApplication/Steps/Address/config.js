import TextField from "../../../../../molecules/Form/Fields/TextField/Placeholder-label";
import FormattedField from "../../../../../molecules/Form/Fields/FormattedField/Placeholder-label";
import Select from "../../../../../molecules/Form/Fields/Select/Default/Placeholder-label";
import { states } from "../../../select-options";

const ownershitOptions = [
  { id: "0", value: "", text: "" },
  { id: "1", value: "yes", text: "Yes" },
  { id: "2", value: "no", text: "No" },
];

export const initForm = () => {
  return {
    street: { value: "", message: "", required: true },
    city: { value: "", message: "", required: true },
    unit: { value: "", message: "", required: false },
    state: { value: "", message: "", required: true },
    zip: { value: "", message: "", required: true },
    requestedAmount: { value: "", message: "", required: true },
    income: { value: "", message: "", required: true },
    ownership: {
      value: "",
      message: "",
      required: true,
    },
    years: { value: "", message: "", required: true },
  };
};

export const renderFields = (form) => [
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
    options: states,
    label: "State",
    message: form.state.message,
  },
  {
    value: form.zip.value,
    name: "zip",
    component: FormattedField,
    label: "Zip Code",
    format: "#####",
    placeholder: "Enter zip code",
    message: form.zip.message,
  },
  {
    value: form.ownership.value,
    name: "ownership",
    component: Select,
    options: ownershitOptions,
    label: "Do you own this residence?",
    message: form.ownership.message,
  },
  {
    value: form.years.value,
    name: "years",
    component: FormattedField,
    label: "Years at Address",
    format: "##",
    placeholder: "10",
    message: form.years.message,
  },
  {
    value: form.requestedAmount.value,
    name: "requestedAmount",
    component: FormattedField,
    prefix: "$",
    thousandSeparator: true,
    label: "Enter Loan Amount",
    placeholder: "$2,000",
    message: form.requestedAmount.message,
  },
  {
    value: form.income.value,
    name: "income",
    component: FormattedField,
    prefix: "$",
    thousandSeparator: true,
    label: "Gross Annual Income",
    placeholder: "100,000",
    message: form.income.message,
  },
];
