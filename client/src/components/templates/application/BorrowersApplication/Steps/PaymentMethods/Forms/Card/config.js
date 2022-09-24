import TextField from "../../../../../../../molecules/Form/Fields/TextField/Placeholder-label";
import FormattedField from "../../../../../../../molecules/Form/Fields/FormattedField/Placeholder-label";

export const renderCardDetail = (form) => [
  {
    value: form.cardNumber.value,
    name: "cardNumber",
    component: FormattedField,
    label: "Card Number",
    format: "############",
    placeholder: "############",
    message: form.cardNumber.message,
  },
  {
    value: form.fullName.value,
    name: "fullName",
    component: TextField,
    label: "Full Name",
    placeholder: "Temeka Adams",
    message: form.fullName.message,
  },
  {
    value: form.expirationDate.value,
    name: "expirationDate",
    component: FormattedField,
    label: "Expiration Date",
    format: "##/##",
    placeholder: "MM/YY",
    message: form.expirationDate.message,
  },
  {
    value: form.securityCode.value,
    name: "securityCode",
    component: FormattedField,
    type: "password",
    label: "Security Code",
    format: "###",
    placeholder: "###",
    message: form.securityCode.message,
  },
];
