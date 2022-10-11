import TextField from "../../../../../molecules/Form/Fields/TextField/Placeholder-label";
import FormattedField from "../../../../../molecules/Form/Fields/FormattedField/Placeholder-label";
import { states as statesOptions } from "../../../select-options";
import Select from "../../../../../molecules/Form/Fields/Select/Default/Placeholder-label";

export const initForm = ({
  practiceName = "",
  yearsInBusiness = "",
  city = "",
  email = "",
  stateCode = "",
  address = "",
  tin = "",
  phone = "",
  website = "",
  zip = "",
  annualRevenue = "",
}) => {
  return {
    name: { value: practiceName || "", message: "", required: true },
    phone: { value: phone || "", message: "", required: true },
    website: { value: website || "", message: "", required: true },
    email: { value: email || "", message: "", required: true },
    tin: { value: tin || "", message: "", required: true },
    street: { value: address || "", message: "", required: true },
    city: { value: city || "", message: "", required: true },
    state: { value: stateCode || "", message: "", required: true },
    zip: { value: zip || "", message: "", required: true },
    annualRevenue: { value: annualRevenue || "", message: "", required: true },
    yearsInBusiness: {
      value: yearsInBusiness || "",
      message: "",
      required: true,
    },
  };
};

export const renderBusinessAddressFields = (form) => [
  {
    value: form.street.value,
    name: "street",
    component: TextField,
    label: "Street",
    placeholder: "Enter street",
    message: form.street.message,
  },
  {
    value: form.city.value,
    name: "city",
    component: TextField,
    label: "city",
    placeholder: "Enter city",
    message: form.city.message,
  },
  {
    value: form.state.value,
    name: "state",
    component: Select,
    label: "state",
    options: statesOptions,
    message: form.state.message,
  },
  {
    value: form.zip.value,
    name: "zip",
    component: FormattedField,
    label: "Zip Code",
    format: "#####",
    placeholder: "Enter zip",
    message: form.zip.message,
  },
];

export const renderFields = (form) => [
  {
    value: form.name.value,
    name: "name",
    component: TextField,
    label: "Business Name",
    placeholder: "Business Name",
    message: form.name.message,
  },
  {
    value: form.phone.value,
    name: "phone",
    component: FormattedField,
    label: "Business Phone Number",
    mask: "_",
    format: "+1 (###) ### ####",
    placeholder: "+1 (###) ### ####",
    message: form.phone.message,
  },
  {
    value: form.email.value,
    name: "email",
    component: TextField,
    label: "Primary Email",
    placeholder: "Primary Email",
    message: form.email.message,
  },
  {
    value: form.website.value,
    name: "website",
    component: TextField,
    label: "Business Website",
    placeholder: "http://www.url.com",
    message: form.website.message,
  },
  {
    value: form.tin.value,
    name: "tin",
    component: FormattedField,
    label: "Business tax ID #",
    format: "##-#######",
    placeholder: "XX-XXXXXXX",
    message: form.tin.message,
  },
  {
    value: form.yearsInBusiness.value,
    name: "yearsInBusiness",
    component: FormattedField,
    label: "Years in Business",
    format: "##",
    message: form.yearsInBusiness.message,
  },
  {
    value: form.annualRevenue.value,
    name: "annualRevenue",
    component: FormattedField,
    placeholder: "enter annualRevenue",
    message: form.annualRevenue.message,
    label: "Annual Revenue",
    prefix: "$",
    thousandSeparator: true,
  },
];
