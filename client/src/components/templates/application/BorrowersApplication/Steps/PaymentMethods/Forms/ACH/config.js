import TextField from "../../../../../../../molecules/Form/Fields/TextField/Placeholder-label";
import FormattedField from "../../../../../../../molecules/Form/Fields/FormattedField/Placeholder-label";

export const renderACHPayment = (form) => [
  {
    value: form.routingNumber.value,
    name: "routingNumber",
    component: FormattedField,
    label: "Routing Number",
    format: "#########",
    mask: "_",
    placeholder: "#########",
    message: form.routingNumber.message,
  },
  {
    value: form.financialInstitution.value,
    name: "financialInstitution",
    component: TextField,
    label: "Financial Institution",
    placeholder: "Bank of America",
    message: form.financialInstitution.message,
  },
  {
    value: form.accountNumber.value,
    name: "accountNumber",
    component: FormattedField,
    label: "Account Number",
    format: "#################",
    placeholder: "enter account number",
    message: form.accountNumber.message,
  },
  {
    value: form.reaccountNumber.value,
    name: "reaccountNumber",
    component: FormattedField,
    label: "Repeat Account Number",
    format: "#################",
    placeholder: "repeat account number",
    message: form.reaccountNumber.message,
  },
];
