import Select from "../../../../../molecules/Form/Fields/Select/Mulitselect";

export const initForm = () => {
  return {
    verticals: { value: [], message: "" },
  };
};

export const renderSelectFields = (form, options) => [
  {
    value: form.verticals.value,
    name: "verticals",
    labelledBy: "Select Vertical",
    component: Select,
    options,
    message: form.verticals.message,
  },
];
