export type userInfo = {
  firstName: string;
  lastName: string;
  phones: Array<string>;
  ssnNumber: string;
  dateOfBirth: any;
  email: string;
  password: string;
  source: string;
  referredBy?: string;
};

export type updatedUserInfo = {
  city: string;
  street: string;
  state: string;
  zipCode: string;
  userId: string;
};

export type contractorInfo = {
  firstName: string;
  middleName: string;
  lastName: string;
  phones: Array<string>;
  ssnNumber: string;
  dateOfBirth: any;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  email: string;
  password: string;
  source: string;
};

export type userEmployementInfo = {
  userId: string;
  incompeType: string;
  employerName: string;
  workPhone?: string;
  employerStatus?: string;
  paymentFrequency: string;
  lastPaydate: any;
  nextPayDate: any;
  secondPayDate: any;
};

// old types

export type IPersonalInfoApi = {
  id?: string;
  addNewScreenTracking?: boolean;
  screenTrackingId?: string;
  city?: string;
  driversLicenseNumber?: string;
  driversLicenseState?: string;
  // eslint-disable-next-line
  dob_month?: any;
  // eslint-disable-next-line
  dob_day?: any;
  // eslint-disable-next-line
  dob_year?: any;
  dubration?: string;
  email?: string;
  firstName?: string;
  lastScreen?: string;
  lastName?: string;
  month?: string;
  middleName?: string;
  notApplication?: boolean;
  password?: string;
  phone?: string;
  state?: string;
  street?: string;
  requestedAmount?: string;
  reason?: string;
  ssnNumber?: string;
  unitApt?: string;
  zipCode?: string;
};

export type SetAccountProps = {
  requestedAmount: string;
  city: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
  reason: string;
  state: string;
  street: string;
  unitApt: string;
  zipCode: string;
  // eslint-disable-next-line
  dob_month?: any;
  // eslint-disable-next-line
  dob_day?: any;
  // eslint-disable-next-line
  dob_year?: any;
};

export type IOffers = {
  screenTrackingId?: string;
  userId?: string;
  requestedLoanAmount: number;
  frequency?: string;
  dry?: boolean;
  customTerm?: number;
};

export type IIncome = {
  userId: string;
  annualIncome: number;
  additionalIncome: number;
};

export type ISelectOffer = {
  screenTrackingId: string;
  term: number;
};

export type IResponse = {
  data: any;
  error: null | {
    message: string;
  };
};

export type IArgylePayDistConf = {
  userId: string;
  amount: number;
  canChange?: boolean;
};

export type IUploadDocument = {
  documentType: string;
  driversLicenseFront?: any;
  driversLicenseBack?: any;
  docArray?: any[],
  userId: string;
  screenTrackingId: string;
};

export type IUploadRequiredFiles = {
  docArray: any[];
  userId: string;
  screenTrackingId: string;
};

export type ICreateRic = {
  screenTrackingId: string;
};

export type IBankAccount = {
  userId: string;
  accountNumber: number;
  name: string;
  routingNumber: number;
};

export type ICancelArgyle = {
  userId: string;
};

export type IAddUserEmployer = {
  userId: string;
  // eslint-disable-next-line
  base_pay: {
    amount: string;
    period: string;
    currency: string;
  };
  // eslint-disable-next-line
  pay_cycle: string;
  employer: string;
};
