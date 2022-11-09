import axios from "axios";
import baseUrl from "../app.config";
import { getRequester } from "./requester";

export async function fetchContractDataApi() {
  let response: any = { data: null, error: null };
  try {
    response = await getRequester().get(`${baseUrl}/api/application/contract`);
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function finalizeContractApi() {
  let response: any = { data: null, error: null };
  try {
    response = await getRequester().post(`${baseUrl}/api/application/finalize`);
  } catch (error) {
    response.error = error;
  }
  return response;
}

interface ISaveSignature {
  screenTrackingId: string;
  hiddenSignatureId?: string;
  imgBase64: string;
}

export async function saveSignatureApi(body: ISaveSignature) {
  let response: any = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/api/application/esignature`,
      body
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}
