export const BASE_ROUTE = "/borrower";

export const pageName = {
  DOCUMENT_CENTER: "document-center",
  LOAN_INFORMATION: "loan-information",
  WORK_COMPLETION: "work-completion",
  LOGIN: "login",
  FORGOT_PASSWORD: "forgot-password",
};

const {
  DOCUMENT_CENTER,
  LOAN_INFORMATION,
  WORK_COMPLETION,
  LOGIN,
  FORGOT_PASSWORD,
} = pageName;

export const routes = {
  USER_INFORMATION: `${BASE_ROUTE}/`,
  DOCUMENT_CENTER: `${BASE_ROUTE}/${DOCUMENT_CENTER}`,
  LOAN_INFORMATION: `${BASE_ROUTE}/${LOAN_INFORMATION}`,
  WORK_COMPLETION: `${BASE_ROUTE}/${WORK_COMPLETION}`,
  LOGIN: `${BASE_ROUTE}/${LOGIN}`,
  FORGOT_PASSWORD: `${BASE_ROUTE}/${FORGOT_PASSWORD}`,
};
