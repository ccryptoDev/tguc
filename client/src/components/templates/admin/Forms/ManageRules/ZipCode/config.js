import FormattedField from "../../../../../molecules/Form/Fields/FormattedField/Placeholder-label";

export const initForm = () => {
  return {
    zipCode: { value: "", message: "" },
    radius: { value: "", message: "" },
  };
};

export const renderZipCodeFields = (form) => [
  {
    value: form.zipCode.value,
    name: "zipCode",
    label: "Zip Code",
    component: FormattedField,
    message: form.zipCode.message,
    format: "#####",
  },
  {
    value: form.radius.value,
    name: "radius",
    label: "Radius",
    component: FormattedField,
    message: form.radius.message,
  },
];
