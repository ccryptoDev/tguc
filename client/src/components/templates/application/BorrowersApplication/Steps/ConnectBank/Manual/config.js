import TextField from "../../../../../../molecules/Form/Fields/TextField/Placeholder-label";
import FormattedField from "../../../../../../molecules/Form/Fields/FormattedField/Placeholder-label";

export const initForm = () => {
  return {
    bankName: { value: "", message: "" },
    accountHolder: { value: "", message: "" },
    routingNumber: { value: "", message: "" },
    accountNumber: { value: "", message: "" },
    confirmAccountNumber: { value: "", message: "" },
  };
};

export const renderFormFields = (form) => [
  {
    value: form.bankName.value,
    name: "bankName",
    component: TextField,
    label: "Bank Name",
    placeholder: "Bank of America",
    message: form.bankName.message,
  },
  {
    value: form.accountHolder.value,
    name: "accountHolder",
    component: TextField,
    label: "Primary Account Holder",
    placeholder: "Temeka Adams",
    message: form.accountHolder.message,
  },
  {
    value: form.routingNumber.value,
    name: "routingNumber",
    component: FormattedField,
    label: "Routing Number",
    format: "#########",
    placeholder: "number should be 9 digits long",
    message: form.routingNumber.message,
  },
  {
    value: form.accountNumber.value,
    name: "accountNumber",
    component: FormattedField,
    label: "Account Number",
    format: "############",
    placeholder: "",
    message: form.accountNumber.message,
  },
  {
    value: form.confirmAccountNumber.value,
    name: "confirmAccountNumber",
    component: FormattedField,
    label: "Confirm Account Number",
    format: "############",
    placeholder: "",
    message: form.confirmAccountNumber.message,
  },
];

export const validateForm = (form) => {
  const newForm = { ...form };
  let isValid = true;
  Object.keys(newForm).forEach((key) => {
    if (key === "accountHolder" && newForm[key].value.trim().length < 3) {
      isValid = false;
      newForm[key].message = "enter first name and last name";
    } else if (
      key === "bankName" &&
      !/^[0-9A-Za-z\s]+$/.test(newForm[key].value.trim())
    ) {
      isValid = false;
      newForm[key].message = "enter a valid bank";
    } else if (key === "routingNumber" && newForm[key].value.length !== 9) {
      isValid = false;
      newForm[key].message = "enter a valid routing number";
    } else if (
      key === "accountNumber" &&
      !!(newForm[key].value.length < 5 || !!(newForm[key].value.length > 15))
    ) {
      isValid = false;
      newForm[key].message = "enter a valid bank account number";
    } else if (
      key === "confirmAccountNumber" &&
      !newForm.accountNumber.message &&
      newForm.accountNumber.value !== newForm.confirmAccountNumber.value
    ) {
      isValid = false;
      newForm[key].message = "this field should match the account number";
    }
  });

  return [isValid, newForm];
};
