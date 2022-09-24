import axios, { AxiosResponse } from "axios";
import { getRequester, fileMultipart } from "./requester";
import {
  TableRequestEvent,
  IResponse,
  IBankAccount,
  IMakePayment,
  IUploadDocument,
  IMessageProps,
} from "./types";
import baseUrl from "../../app.config";
import { getRequester as getUserRequester } from "../requester";

export async function getLoans({
  search,
  perPage,
  skip,
  status,
  source,
}: TableRequestEvent) {
  const page = Math.floor(skip / perPage) + 1;
  const requestParams: {
    status: string | string[];
    perPage: number;
    page: number;
    search?: string;
    source?: string;
  } = { perPage, page, status };
  if (search) requestParams.search = search;
  if (source) requestParams.source = source;
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(`/api/admin/dashboard/loans`, {
      params: requestParams,
    });
    // TODO: Error logic around server and request errors
  } catch (error) {
    console.error(error);
    response.error = error;
  }
  return response;
}

export async function getContractors({
  search,
  perPage,
  skip,
  status,
  source,
}: TableRequestEvent) {
  const page = Math.floor(skip / perPage) + 1;
  const requestParams: {
    status: string | string[];
    perPage: number;
    page: number;
    search?: string;
    source?: string;
  } = { perPage, page, status };
  if (search) requestParams.search = search;
  if (source) requestParams.source = source;
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(`/api/admin/dashboard/contractors`, {
      params: requestParams,
    });
    // TODO: Error logic around server and request errors
  } catch (error) {
    console.error(error);
    response.error = error;
  }
  return response;
}

export async function getTotalRowsByStatus() {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(
      "/api/admin/dashboard/loans/counters",
      {}
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function getUsers({ search, perPage, skip }: TableRequestEvent) {
  const page = Math.floor(skip / perPage) + 1;
  const requestParams: {
    // perPage: number;
    page: number;
    search?: string;
  } = { /* perPage,*/ page };
  if (search) requestParams.search = search;
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get("/api/admin/dashboard/users", {
      params: { page, search },
    });
  } catch (error) {
    console.error(error);
    response.error = error;
  }
  if (response.data) {
    // this endpoint gets not standard data field names
    response.data = {
      items: response?.data?.rows,
      total: response?.data?.totalRows,
    };
  }
  return response;
}

export async function getUser(userId: string) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(
      `${baseUrl}/api/admin/dashboard/users/${userId}`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function getApplication(screenTrackingId: string) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(
      `/api/admin/dashboard/application/info/${screenTrackingId}`
    );
  } catch (error) {
    response.error = error;
  }

  return response;
}

export async function approveContractorApplication(email: string) {
  let response = { data: null, error: null };
  try {
    response = await getUserRequester().get(
      `/api/admin/dashboard/application/contractor/approve/${email}`
    );
  } catch (error) {
    response.error = error;
  }

  return response;
}

export async function denyContractorApplication(email: string) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(
      `/api/admin/dashboard/application/contractor/deny/${email}`
    );
  } catch (error) {
    response.error = error;
  }

  return response;
}

export async function updateContractorApplicationStatus(
  email: string,
  status: string
) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(
      `${baseUrl}/api/admin/dashboard/application/contractor/update/${email}/${status}`
    );
  } catch (error) {
    response.error = error;
  }

  return response;
}

export async function approveBorrowerApplication(id: string) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().put(
      `${baseUrl}/api/application/approve/${id}`
    );
  } catch (error) {
    response.error = error;
  }

  return response;
}

export async function declineBorrowerApplication(id: string, data: any) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().put(
      `${baseUrl}/api/application/deny/${id}`,
      data
    );
  } catch (error) {
    response.error = error;
  }

  return response;
}

export async function getCreditReport(screenTrackingId: string) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(
      `/api/admin/dashboard/creditReport/${screenTrackingId}`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function getPaymentManagement(screenTrackingId: string) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(
      `/api/admin/dashboard/loans/paymentSchedule/${screenTrackingId}`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function getPaymentPreview(
  screenTrackingId: string,
  params?: Record<string, any>
) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(
      `/api/admin/dashboard/loans/previewPayment/${screenTrackingId}`,
      { params }
    );
  } catch (error) {
    console.error(error);
    response.error = error;
  }
  return response;
}

export async function getUserCards(screenTrackingId: string) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(
      `/api/admin/dashboard/users/cards/${screenTrackingId}`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function submitPayment(
  screenTrackingId: string,
  data: { paymentMethodToken: string; amount: number; paymentDate: Date }
) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().post(
      `/api/admin/dashboard/loans/submitPayment/${screenTrackingId}`,
      data
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function changePaymentAmount(
  screenTrackingId: string,
  data: { amount: number }
) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().patch(
      `/api/admin/dashboard/loans/changePaymentAmount/${screenTrackingId}`,
      data
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

type AddCardProps = {
  screenTrackingId: string;
  data: {
    billingAddress1: string;
    billingCity: string;
    billingFirstName: string;
    billingLastName: string;
    billingState: string;
    billingZip: string;
    cardCode: string;
    cardNumber: string;
    expMonth: string;
    expYear: string;
  };
};

export const addCard = async ({ screenTrackingId, data }: AddCardProps) => {
  let response = { data: null, error: null };
  try {
    response = await getRequester().post(`/application/saveCardData/`, {
      screenTrackingId,
      ...data,
    });
  } catch (error) {
    response.error = error;
  }
  return response;
};

export async function getAdmins({
  search,
  isAgent,
  skip,
  perPage,
}: TableRequestEvent) {
  const page = Math.floor(skip / perPage) + 1;
  const requestParams: {
    page: number;
    search?: string;
  } = { page };
  if (search) requestParams.search = search;
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get("/api/admin/dashboard/admins", {
      params: { page, search, isAgent, perPage },
    });
  } catch (error) {
    console.error(error);
    response.error = error;
  }
  if (response.data) {
    // this endpoint gets not standard data field names
    response.data = {
      items: response?.data?.rows,
      total: response?.data?.totalRows,
    };
  }
  return response;
}

export async function getAgents({
  search,
  isAgent,
  skip,
  perPage,
}: TableRequestEvent) {
  const page = Math.floor(skip / perPage) + 1;
  const requestParams: {
    page: number;
    search?: string;
  } = { page };
  if (search) requestParams.search = search;
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get("/api/admin/dashboard/agents", {
      params: { page, search, isAgent, perPage },
    });
  } catch (error) {
    console.error(error);
    response.error = error;
  }
  if (response.data) {
    // this endpoint gets not standard data field names
    response.data = {
      items: response?.data?.rows,
      total: response?.data?.totalRows,
    };
  }
  return response;
}

export async function getLocations() {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(
      "/api/admin/dashboard/practiceManagements/locations"
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function getRoles() {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get("/api/admin/roles");
  } catch (error) {
    response.error = error;
  }
  return response;
}

type IAddAdmin = {
  email: string;
  password: string;
  phoneNumber: string;
  userName: string;
  isAgent?: boolean;
  role: string;
  practiceManagement?: string;
};

export async function addAdmin(body: IAddAdmin) {
  let response = { body: null, error: { message: "" } };
  try {
    response = await getRequester().post("/api/admin/dashboard/admins", body);
  } catch (error) {
    response.error = { message: error?.response?.data?.message };
  }
  return response;
}

export async function getAdminById(id: string) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(`/api/admin/dashboard/admins/${id}`);
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function updateAdminById(body: {
  id: string;
  email?: string;
  phoneNumber?: string;
  userName?: string;
  password?: string;
}) {
  let response = { data: null, error: { message: "" } };
  try {
    response = await getRequester().patch(
      `/api/admin/dashboard/admins/${body.id}`,
      body
    );
  } catch (error) {
    response.error = { message: error?.response?.data?.message };
  }
  return response;
}

export async function inviteBorrowerByEmail(body: { email?: string }) {
  let response = { data: null, error: { message: "" } };
  try {
    response = await getRequester().post(
      `/api/admin/dashboard/inviteBorrower/${body.email}`,
      body
    );
  } catch (error) {
    response.error = { message: error?.response?.data?.message };
  }
  return response;
}

export async function inviteBorrowerByPhone(body: { phone?: string }) {
  let response = { data: null, error: { message: "" } };
  try {
    response = await getRequester().post(
      `/api/admin/dashboard/inviteBorrowerPhone/${body.phone}`,
      body
    );
  } catch (error) {
    response.error = { message: error?.response?.data?.message };
  }
  return response;
}

export async function getUserDocuments(screenTrackingId: string) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(
      `/api/admin/dashboard/users/documents/${screenTrackingId}`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function getUserConsents(screenTrackingId: string) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(
      `/api/admin/dashboard/users/consents/${screenTrackingId}`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function uploadDocument({
  screenTrackingId,
  data,
}: {
  screenTrackingId: string;
  data: {
    documentType: "drivers license" | "passport";
    passport?: string;
    driversLicenseFront?: string;
    driversLicenseBack?: string;
  };
}) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().post(
      `/api/admin/dashboard/users/documents/${screenTrackingId}`,
      { ...data }
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function getAllPracticeManagements({
  search,
  skip,
  perPage,
}: TableRequestEvent) {
  const page = Math.floor(skip / perPage) + 1;
  const requestParams: {
    page: number;
    search?: string;
  } = { page };
  if (search) requestParams.search = search;
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(
      "/api/admin/dashboard/practiceManagements",
      {
        params: { page, search },
      }
    );
  } catch (error) {
    console.error(error);
    response.error = error;
  }
  return response;
}

export async function addPracticeManagement(data: {
  address: string;
  city: string;
  location: string;
  managementRegion: string;
  openDate: string;
  phone: string;
  region: string;
  regionalManager: string;
  stateCode: string;
  zip: string;
}) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().post(
      "/api/admin/dashboard/practiceManagements",
      data
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function getPracticeManagementById(id: string) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(
      `/api/admin/dashboard/practiceManagements/${id}`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function updatePracticeManagementById(
  id: string,
  data?: {
    address?: string;
    city?: string;
    location?: string;
    managementRegion?: string;
    openDate?: string;
    phone?: string;
    region?: string;
    regionalManager?: string;
    stateCode?: string;
    zip?: string;
  }
) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().patch(
      `/api/admin/dashboard/practiceManagements/${id}`,
      data
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function changePassword({
  existingPassword,
  newPassword,
  userId,
}: {
  existingPassword: string;
  newPassword: string;
  userId: string;
}) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().patch(`/api/admin/changePassword`, {
      existingPassword,
      newPassword,
      userId,
    });
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function sendApplicationLink(requestBody: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  practiceManagement: string;
  sendEmail?: boolean;
  sendSms?: boolean;
  source: "web" | "lead-list";
}) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/api/admin/dashboard/application/link`,
      requestBody
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function getAllLogActivities({
  search,
  skip,
  perPage,
}: TableRequestEvent) {
  const page = Math.floor(skip / perPage) + 1;
  const requestParams: {
    page: number;
    search?: string;
  } = { page };
  if (search) requestParams.search = search;
  let response = { data: null, error: null };
  try {
    response = await getRequester().get("/api/admin/dashboard/logActivities", {
      params: { page, search },
    });
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function getAllLogActivitiesByScreenTrackingId(
  screenTrackingId: string,
  { search, skip, perPage }: TableRequestEvent
): Promise<AxiosResponse<any>> {
  const page = Math.floor(skip / perPage) + 1;
  const requestParams: {
    page: number;
    search?: string;
  } = { page };
  if (search) requestParams.search = search;

  const response = await getRequester().get(
    `/api/admin/dashboard/logActivities/user/${screenTrackingId}`,
    {
      params: { page, search },
    }
  );
  return response;
}

export async function getLogActivityById(id: string) {
  const response = await getRequester().get(
    `/api/admin/dashboard/logActivities/${id}`
  );

  return response;
}

export async function createLogActivity(requestBody: {
  moduleName: string;
  message: string;
  data?: any;
  loanReference?: string;
  paymentManagementId?: string;
  screenTrackingId?: string;
}) {
  const response = await getRequester().post(
    "/api/admin/dashboard/logActivities",
    requestBody
  );

  return response;
}

export async function getAllCommentsByScreenTrackingId(
  screenTrackingId: string,
  { search, skip, perPage }: TableRequestEvent
): Promise<AxiosResponse<any>> {
  const page = Math.floor(skip / perPage) + 1;
  const requestParams: {
    page: number;
    search?: string;
  } = { page };
  if (search) requestParams.search = search;

  const response = await getRequester().get(
    `/api/admin/dashboard/comments/${screenTrackingId}`,
    {
      params: { page, search },
    }
  );
  return response;
}

export async function addComment(
  screenTrackingId: string,
  requestBody: { subject: string; comment: string }
) {
  const response = await getRequester().post(
    `/api/admin/dashboard/comments/${screenTrackingId}`,
    requestBody
  );

  return response;
}

export async function getContractDataApi(screentTrackingId: string) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(
      `/api/admin/dashboard/application/info/${screentTrackingId}`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function addBankAccountApi(body: IBankAccount) {
  let response = { data: null, error: { message: "" } };
  try {
    response = await getRequester().post(`/api/application/saveCardData`, body);
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function makePaymentApi(body: IMakePayment) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().post(`/api/makePayment`, body);
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function documentUploadApi(body: IUploadDocument) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/api/application/uploadDocument`,
      body
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function getUserDocsApi(id: string) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get(
      `${baseUrl}/api/admin/dashboard/users/documents/${id}`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function fetchCommentsApi(screenTrackingId: string) {
  let response = { data: { items: [], total: 0 }, error: null };
  try {
    response = await getRequester().get(
      `${baseUrl}/api/admin/dashboard/comments/${screenTrackingId}`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function postCommentApi(body: IMessageProps) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/api/admin/dashboard/comments/${body.screenTrackingId}`,
      body
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function updateCreditRulesApi(body: any) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/api/application/modifyCreditRules`,
      body
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function getCreditRulesApi() {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(
      `${baseUrl}/api/application/creditRules`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function setZipCodeToMerchant(body: any) {
  const { table, userId } = body;
  let response = { data: null, error: null };
  try {
    response = await getRequester().patch(
      `${baseUrl}/api/application/zipcode`,
      {
        zipcodeAndRadius: [...table],
        userId,
      }
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function getZipCodes(id: string): Promise<any[]> {
  let response = { data: [], error: null };
  try {
    response = await getRequester().get(
      `${baseUrl}/api/application/zipcodes/${id}`
    );
  } catch (error) {
    response.error = error;
  }
  return response.data;
}

export async function updateUserRules(body: any) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().patch(
      `${baseUrl}/api/application/user/rules`,
      body
    );
  } catch (error) {
    response.error = error;
  }
  // console.log("response client \n\n", response);
  return response;
}

export async function updateDocumentStatus({
  documentId,
  status,
  reason,
}: {
  documentId: string;
  status: string;
  reason?: string;
}) {
  let response = { data: null, error: null };
  const body = {
    documentId,
    status,
    reason,
  };
  try {
    response = await getRequester().patch(
      `${baseUrl}/api/admin/dashboard/users/updateDocumentStatus`,
      body
    );
  } catch (error) {
    response.error = error;
  }
  console.log("response client \n\n", response);
  return response;
}

export async function setWorkCompletion(
  screenTrackingId: string,
  status: boolean
) {
  let response = { data: null, error: null };
  const body = {
    status,
  };
  try {
    response = await getRequester().patch(
      `${baseUrl}/api/admin/dashboard/loans/workcompletion/${screenTrackingId}`,
      body
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function disableAgentApi(id: string) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().delete(
      `${baseUrl}/api/admin/dashboard/agents/${id}`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}
