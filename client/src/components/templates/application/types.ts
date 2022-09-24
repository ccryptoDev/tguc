export type ITextField = {
  value: string;
  valid?: boolean;
  required?: boolean;
  message: string;
};

export type ITextFieldNumber = {
  value: number;
  valid?: boolean;
  required?: boolean;
  message: string;
};

export type IPoliciesForm = {
  policies: {
    value: boolean;
    valid: boolean;
    required: boolean;
    message: string;
  };
  additional: {
    value: boolean;
    valid: boolean;
    required: boolean;
    message: string;
  };
};

export type IForgotPasswordForm = {
  email: ITextField;
  code: ITextField;
};

export type IRegisterForm = {
  email: ITextField;
  password: ITextField;
  repassword: ITextField;
};

export type IPersonalForm = {
  firstName: ITextField;
  lastName: ITextField;
  email: ITextField;
  password: ITextField;
  repassword: ITextField;
  dob: ITextField;
  phone: ITextField;
  street: ITextField;
  state: ITextField;
  city: ITextField;
  zipCode: ITextField;
  requestedAmount: ITextField;
  customTerm: ITextField;
  reason: ITextField;
  terms: { value: any; valid?: boolean; required: boolean; message: string };
  type: ITextField;
};

export type IEmploymentInfo = {
  incompeType: string;
  employerName: string;
  workPhone: string;
  employerStatus: string;
  paymentFrequency: string;
  lastPaydate: string;
  nextPaydate: string;
  secondPaydate: string;
};

export type IPersonalInfoForm = {
  firstName: string;
  lastName: string;
  phones: string[];
  dateOfBirth: string;
  ssnNumber: string | number;
  email: string;
};
