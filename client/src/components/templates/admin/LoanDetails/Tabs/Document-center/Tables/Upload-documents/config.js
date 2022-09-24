export const docTypes = {
  DRIVER_LICENSE: "drivers license",
  PASSPORT: "passport",
  INSURANCE: "insurance",
  STATE_BUSINESS_LICENSE: "state business license",
  CONTRACTOR_LICENSE: "contractor license",
  W9: "w9",
  WORK_ORDER: "work order",
};

export const fieldNames = {
  licenseFront: "licenseFront",
  licenseBack: "licenseBack",
  passport: "passport",
  insurance: "insurance",
  stateBusinessLicense: "stateBusinessLicense",
  contractorLicense: "contractorLicense",
  w9: "w9",
  workOrder: "workOrder",
};

export const initForm = () => {
  return {
    [fieldNames.licenseFront]: { value: "", message: "" },
    [fieldNames.licenseBack]: { value: "", message: "" },
    [fieldNames.passport]: { value: "", message: "" },
    [fieldNames.insurance]: { value: "", message: "" },
    [fieldNames.stateBusinessLicense]: { value: "", message: "" },
    [fieldNames.contractorLicense]: { value: "", message: "" },
    [fieldNames.w9]: { value: "", message: "" },
    [fieldNames.workOrder]: { value: "", message: "" },
  };
};

export const documentOptions = [
  { value: "", text: "Select Document Type", id: "1" },
  { value: docTypes.DRIVER_LICENSE, text: "Driver's License or Id", id: "2" },
  { value: docTypes.PASSPORT, text: "Passport", id: "3" },
  { value: docTypes.INSURANCE, text: "Insurance", id: "4" },
  {
    value: docTypes.STATE_BUSINESS_LICENSE,
    text: "State Business License",
    id: "5",
  },
  { value: docTypes.CONTRACTOR_LICENSE, text: "Contractor License", id: "6" },
  { value: docTypes.W9, text: "W9", id: "7" },
  { value: docTypes.WORK_ORDER, text: "Work Order", id: "8" },
];
