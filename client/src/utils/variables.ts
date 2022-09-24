type IStatus = {
  APPROVED: string;
  PENDING: string;
  DENIED: string;
  EXPIRED: string;
  IN_REPAYMENT: string;
  PAID: string;
  FUNDED: string;
  QUALIFIED: string;
  NON_QUALIFIED: string;
  PENDING_DISBURSEMENT: string;
  ALL: string[];
};

export const tStatus: IStatus = {
  APPROVED: "approved",
  PENDING: "pending",
  DENIED: "denied",
  EXPIRED: "expired",
  IN_REPAYMENT: "repayment",
  PAID: "paid",
  FUNDED: "funded",
  QUALIFIED: "qualified",
  NON_QUALIFIED: "non-qualified",
  PENDING_DISBURSEMENT: "pending-disbursement",
  ALL: [
    "approved",
    "pending",
    "denied",
    "expired",
    "funded",
    "qualified",
    "non-qualified",
    "pending-disbursement",
  ],
};

type IFilter = {
  APPROVED: string;
  PENDING: string;
  DENIED: string;
  EXPIRED: string;
  IN_REPAYMENT: string;
  PAID: string;
  FUNDED: string;
  QUALIFIED: string;
  NON_QUALIFIED: string;
  PENDING_DISBURSEMENT: string;
  ALL: string;
};

export const tFilter: IFilter = {
  APPROVED: "Approved",
  PENDING: "Pending Review",
  DENIED: "Denied",
  EXPIRED: "Expired",
  IN_REPAYMENT: "In-Repayment",
  PAID: "Paid",
  FUNDED: "Funded",
  QUALIFIED: "Qualified",
  NON_QUALIFIED: "Non-Qualified",
  PENDING_DISBURSEMENT: "Pending Disbursement",
  ALL: "All",
};

type IType = {
  MANAGE_USERS: string;
};

export const tType: IType = {
  MANAGE_USERS: "MANAGE_USERS",
};
