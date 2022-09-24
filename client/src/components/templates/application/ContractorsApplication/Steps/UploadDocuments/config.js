import React from "react";
import W9Header from "./Heading-w9";
import StatesNote from "./StatesNote";

export const initForm = () => {
  return {
    insurance: { value: [], message: "", required: true, limit: 1 },
    stateBusinessLicense: { value: [], message: "", required: true, limit: 1 },
    contractorLicense: { value: [], message: "", required: true, limit: 1 },
    w9: { value: [], message: "", required: true, limit: 1 },
    workOrder: { value: [], message: "", required: true, limit: 1 },
  };
};

export const renderFields = ({ form, onStateBusinessLicenseRequired }) => [
  {
    files: form.insurance.value,
    message: form.insurance.message,
    heading: "General Liability Insurance Certificate",
    subheading: "Minimum $300K of coverage",
    name: "insurance",
  },
  {
    files: form.stateBusinessLicense.value,
    message: form.stateBusinessLicense.message,
    heading: "Copy of State Business License",
    subheading: "",
    name: "stateBusinessLicense",
  },
  {
    files: form.contractorLicense.value,
    message: form.contractorLicense.message,
    heading: "Copy of each State's Contractor's License",
    subheading: (
      <StatesNote
        name="contractorLicense"
        value={!form.contractorLicense.required}
        onCheckbox={onStateBusinessLicenseRequired}
      />
    ),
    name: "contractorLicense",
  },
  {
    files: form.w9.value,
    message: form.w9.message,
    heading: <W9Header />,
    subheading: "",
    name: "w9",
  },
  {
    files: form.workOrder.value,
    message: form.workOrder.message,
    heading: "Example work order or contract form",
    subheading: "(Must include cancellation language)",
    name: "workOrder",
  },
];
