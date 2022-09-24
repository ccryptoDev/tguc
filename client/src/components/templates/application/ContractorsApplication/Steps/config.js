const stepName = {
  APPLY: "apply",
  ADDRESS: "address-information",
  DOCUMENT_UPLOAD: "document-upload",
  WAITING_FOR_APPROVAL: "waiting-approval",
  CONTRACT: "sign-contract",
  CONTRACT_SIGNED: "contract-signed",
};

export const parseStepNames = (name) => {
  switch (name) {
    case stepName.APPLY:
      return 1;
    case stepName.ADDRESS:
      return 2;
    case stepName.DOCUMENT_UPLOAD:
      return 3;
    case stepName.WAITING_FOR_APPROVAL:
      return 4;
    case stepName.CONTRACT:
      return 5;
    case stepName.CONTRACT_SIGNED:
      return 6;
    default:
      return 1;
  }
};
