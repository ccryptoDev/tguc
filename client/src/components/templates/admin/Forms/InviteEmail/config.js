import TextField from "../../../../molecules/Form/Fields/TextField";

export const initialForm = {
  email: { value: "", message: "", required: true },
};

export const fields = (form) => [
  {
    value: form.email?.value || "",
    placeholder: "Enter applicant email",
    label: "Email",
    message: form.email?.message || "",
    name: "email",
    component: TextField,
  },
];
