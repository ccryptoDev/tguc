export const stepNames = {
  ADDRESS: "address-information",
  CONNECT_BANK: "connect-bank",
  WAITING_FOR_APPROVAL: "waiting-for-approve",
  OFFER: "select-offer",
  PAYMENT_DETAILS: "payment-details",
  CONTRACT: "sign-contract",
  SSN: "social-security-number",
  APPLICATION_COMPLETED: "thank-you",
  DECLINED: "declined",
};

export const parseStepNames = (name) => {
  switch (name) {
    case stepNames.ADDRESS:
      return 2;
    case stepNames.CONNECT_BANK:
      return 3;
    case stepNames.WAITING_FOR_APPROVAL:
      return 4;
    case stepNames.OFFER:
      return 5;
    case stepNames.PAYMENT_DETAILS:
      return 6;
    case stepNames.CONTRACT:
      return 7;
    case stepNames.SSN:
      return 8;
    case stepNames.APPLICATION_COMPLETED:
    case stepNames.DECLINED:
      return 9;
    default:
      return 1;
  }
};
