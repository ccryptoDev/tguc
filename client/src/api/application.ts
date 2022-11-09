import axios from "axios";
import { getRequester } from "./requester";
import {
  IPersonalInfoApi,
  IOffers,
  IIncome,
  ISelectOffer,
  IResponse,
  IArgylePayDistConf,
  IUploadDocument,
  ICreateRic,
  IBankAccount,
  ICancelArgyle,
  IAddUserEmployer,
  userInfo,
  userEmployementInfo,
  contractorInfo,
  updatedUserInfo,
} from "./types";
import baseUrl from "../app.config";

// Create new User/application
export async function createNewUserApplication(payload: userInfo) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await axios.post(`${baseUrl}/api/application/apply`, payload);
  } catch (error) {
    response.error = error;
  }
  return response;
}

// Update new User/application after first screen
export async function updateNewUserApplication(payload: updatedUserInfo) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await axios.put(
      `${baseUrl}/api/application/updateApply`,
      payload
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function createNewContractorApplication(payload: contractorInfo) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await axios.post(
      `${baseUrl}/api/application/contractor/apply`,
      payload
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

// Gets the User info
export async function getUserInfo() {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get(`${baseUrl}/ApiGetUserInfo`);
  } catch (error) {
    response.error = error;
  }
  return response;
}

// Updates User info
export async function updateUserInfo(payload: userInfo) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(`${baseUrl}/ApiUpdateUserInfo`);
  } catch (error) {
    response.error = error;
  }
  return response;
}

// Create User Employment info
export async function createNewEmploymentHistory(payload: userEmployementInfo) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/apply/APICreateEmploymentHistory`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

// Gets the User Employment info
export async function getEmploymentHistory() {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get(`${baseUrl}/APIGetEmploymentInfo`);
  } catch (error) {
    response.error = error;
  }
  return response;
}

// Updates User Employment info
export async function updateEmploymentHistory(payload: userEmployementInfo) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(`${baseUrl}/APIUpdateEmployerInfo`);
  } catch (error) {
    response.error = error;
  }
  return response;
}

// Update User Financial info
export async function updateFinancialInfo() {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/ApiUpdateUserFinancialInfo`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

// Creates User Financial info
export async function createUserOffers() {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(`${baseUrl}/createApplicationOffers`);
  } catch (error) {
    response.error = error;
  }
  return response;
}

// Gets the User's Offers
export async function getUserOffers() {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get(
      `${baseUrl}/getApplicationOffers/:userId`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

// Old api endpoints

export async function getTotalRowsByStatus() {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get(`${baseUrl}/application`, {});
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function personalInfoApi(payload: IPersonalInfoApi) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/application/saveUserInfo`,
      payload
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function fetchOffersApi(payload: IOffers) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/application/offers`,
      payload
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function calculateOfferApi(payload: IOffers) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await axios.post(`${baseUrl}/application/offers`, payload);
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function incomeApi(payload: IIncome) {
  let response: IResponse = { data: null, error: null };

  try {
    response = await getRequester().post(
      `${baseUrl}/application/saveIncome`,
      payload
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function creditBureauInquiryApi({
  screenTrackingId,
}: {
  screenTrackingId: string;
}) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/application/creditBureauInquiry`,
      { screenTrackingId }
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function fetchRicApi(userId: string) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get(
      `${baseUrl}/application/promnote/${userId}`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

type IArgyleData = {
  userId: string;
  accountId: string;
};

export async function saveArgyleDataApi(body: IArgyleData) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/application/saveArgyleData`,
      body
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function fetchArgyleToken(userId: string) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/application/getArgyleUserToken`,
      { userId }
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function fetchArgylePaydistConfig(body: IArgylePayDistConf) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/application/getArgylePayDist`,
      body
    );
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

export async function createRicApi(body: ICreateRic) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/application/createRic`,
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
      `${baseUrl}/application/getUserDocuments/${id}`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

type ISaveSignature = {
  userId: string;
  data: string;
};

export async function saveSignature(body: ISaveSignature) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/application/saveSignature`,
      body
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

type IPaySplit = {
  userId: string;
};

export async function finishPaySplitApi(body: IPaySplit) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/application/splitDone`,
      body
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function changePassword({
  newPassword,
  userId,
}: {
  newPassword: string;
  userId: string;
}) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().patch(`${baseUrl}/user/changePassword`, {
      newPassword,
      userId,
    });
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function saveBankAccountApi(body: IBankAccount) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(`/application/saveCardData`, body);
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function cancelArgylePayrollDist(body: ICancelArgyle) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(`/application/removePayDist`, body);
  } catch (error) {
    response.error = error;
  }
  return response.data;
}

export async function fetchMessagesApi(body: any) {
  let response = { data: [], error: null };
  try {
    response = await getRequester().get(`${baseUrl}/application/messages`, {
      params: body,
    });
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function forgotPasswordApi(body: { email: string }) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await axios.post(`${baseUrl}/resetPassword`, body);
  } catch (error) {
    response.error = error;
  }
  return response.data;
}

export async function addEmployerApi(body: IAddUserEmployer) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await axios.post(`${baseUrl}/application/addEmployer`, body);
  } catch (error) {
    response.error = error;
  }
  return response.data;
}

export async function getLinkToken() {
  let response: IResponse = { data: null, error: null };
  try {
    response = await axios.post(`${baseUrl}/api/plaid/createLinkToken`);
  } catch (error) {
    response.error = error;
  }
  return response.data;
}

export async function loginToPlain(publicToken: string) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(`${baseUrl}/api/plaid/loginToPlaid`, {
      public_token: publicToken,
    });
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function changeContractorLastScreen(
  screenId: string,
  lastScreen: string
) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/api/application/changeContractorLastScreen`,
      {
        screenId,
        lastScreen,
      }
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function changeUserLastScreen(userId: string, lastScreen: string) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/api/application/changeUserLastScreen`,
      {
        userId,
        lastScreen,
      }
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function sendNewApplicationEmail(userId: string) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await axios.post(
      `${baseUrl}/api/application/sendNewApplicationEmail`,
      userId
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function sendCompletedApplicationEmail(userId: string) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await axios.post(
      `${baseUrl}/api/application/sendCompletedApplicationEmail`,
      userId
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

interface IUpdateBusinessData {
  yearsInBusiness: string;
  city: string;
  email: string;
  name: string;
  phone: string;
  state: string;
  street: string;
  tin: string;
  website: string;
  zip: string;
  screenTrackingId: string;
}

export async function updateBusinessData(body: IUpdateBusinessData) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().patch(
      `${baseUrl}/api/application/updateBusinessData`,
      body
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function addCardApi(body: any) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/api/application/addCard`,
      body
    );
    console.log("response", response);
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function getPracticeManagementByScreenTrackingId(
  screenTrackingId: string
) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get(
      `${baseUrl}/api/application/practiceManagement/${screenTrackingId}`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function userApproveWorkCompletion() {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().patch(
      `${baseUrl}/api/application/user/setworkcompletion`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function userDeniedWorkCompletion() {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().patch(
      `${baseUrl}/api/application/user/deniedworkcompletion`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function fetchBorrowerOfferApi({
  screenTrackingId,
  amount,
}: {
  screenTrackingId: string;
  amount: number;
}) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(`${baseUrl}/api/application/offers`, {
      requestedLoanAmount: amount,
      screenTrackingId,
    });
  } catch (error) {
    response.error = error;
  }
  return response;
}
export async function setOfferApi(data: any) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/api/application/setOfferData `,
      data
    );
  } catch (err) {
    response.error = err;
  }
  return response;
}
export async function selectOfferApi({
  loanId,
  promoSelected,
  skipAutoPay,
  screenTrackingId,
}: {
  loanId: string;
  promoSelected: boolean;
  skipAutoPay: boolean;
  screenTrackingId: string;
}) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/api/application/selectOffer `,
      {
        loanId,
        promoSelected,
        skipAutoPay,
        screenTrackingId,
      }
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function fetchContractApi({
  screenTrackingId,
}: {
  screenTrackingId: string;
}) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get(
      `${baseUrl}/api/application/contract `,
      {
        params: {
          screenTrackingId,
        },
      }
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function finalizeContractApi({
  screenTrackingId,
  userId,
}: {
  screenTrackingId: string;
  userId: string;
}) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/api/application/finalize`,
      {
        screenTrackingId,
        userId,
      }
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function fetchBorrowerDocumentsApi(userId: string) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get(
      `${baseUrl}/api/application/dashboard`,
      { params: { userId } }
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

interface IInstntDecision {
  formKey: string;
  instntJwt: string;
  transactionId: string;
  decision: string;
  screenTrackingId: string;
}

export async function postInstntDecisionApi(decision: IInstntDecision) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/api/application/instnt`,
      decision
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}
