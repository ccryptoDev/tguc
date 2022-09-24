export interface TablePaginationEvent {
  page: number;
  skip: number;
  perPage: number;
  isReset: boolean;
}

export interface TableNavigationEvent {
  status: string;
}
export interface TableSearchEvent {
  query: string;
}

export interface TableRequestEvent {
  status: string | string[];
  skip: number;
  perPage: number;
  search?: string; //query search string
  source?: string;
  isAgent?: boolean; // if it is an agent or admin
}

export interface IResponse {
  data: null | {
    items?: [];
    total?: number;
    rows?: [];
    totalRows?: number;
  };
  error: null | {
    message: string;
  };
}

export type IBankAccount = {
  userId: string;
  accountNumber: number;
  name: string;
  routingNumber: number;
};

export type IMakePayment = {
  amount: number;
  screenTrackingId: string;
};

export type IUploadDocument = {
  documentType: string;
  driversLicenseFront?: any;
  driversLicenseBack?: any;
  docArray?: any[];
  userId: string;
  screenTrackingId: string;
};

export type IMessageProps = {
  comment: string;
  createdBy: string;
  subject: string;
  screenTrackingId: string;
};
