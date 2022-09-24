import TextField from "../../../../molecules/Form/Fields/TextField";

export const initialForm = {
  phone: { value: "", message: "", required: true },
};

export const fields = (form) => [
  {
    value: form.phone?.value || "",
    placeholder: "Enter applicant phone number",
    label: "Phone Number",
    message: form.phone?.message || "",
    name: "phone",
    component: TextField,
  },
];
