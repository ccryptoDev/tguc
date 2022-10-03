import React, { useState } from "react";
import styled from "styled-components";
import Header from "../../../Components/FormHeader";
import Button from "../../../../../atoms/Buttons/Button";
import attention from "../../../../../../assets/svgs/attention.svg";
import Container from "../../styles";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";
import { initForm } from "./config";
import { validate } from "./validation";
import {
  documentUploadApi,
  changeContractorLastScreen,
} from "../../../../../../api/application";
import FileUploader from "./Forms";
import { parseFilesToStrings } from "../../../../../molecules/Form/Fields/UploadDocument/methods";
import { stepName } from "../config";
import { useUserData } from "../../../../../../contexts/user";

const Notification = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 1.2rem;
  column-gap: 1.2rem;
  border: 1px solid var(--color-orange-dark);
  border-radius: 1.4rem;
  p {
    font-size: 1.2rem;
    color: var(--color-orange-dark);
    font-weight: 700;
    line-height: 1.5;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  row-gap: 10px;
  .upload-documents-list {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
  }
`;

const createFormData = (
  documentType: string,
  docArray: any[],
  userId: string,
  screenTrackingId: string
) => {
  const formData = {
    documentType,
    docArray,
    userId,
    screenTrackingId,
  };
  return formData;
};

const parseDocumentsFormToRequestBody = async (files: any) => {
  const docs: any = {};
  await Promise.all(
    Object.keys(files).map(async (key) => {
      const res = await parseFilesToStrings(files[key].value);
      docs[key] = res;
    })
  );

  return docs;
};

const UploadDocuments = ({ moveToNextStep }: any) => {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<any>(initForm());
  const { user } = useUserData();

  const onSubmitHandler = async (e: any) => {
    e.preventDefault();
    const [isValid, updatedForm] = validate(files);
    if (isValid) {
      setLoading(true);
      const payload = await parseDocumentsFormToRequestBody(files);
      const userId = localStorage.getItem("userId") || "";
      const screenTrackingId = localStorage.getItem("screenTrackingId") || "";
      const docArray = [
        {
          type: "insurance",
          value: payload.insurance[0].value,
        },
        {
          type: "stateBusinessLicense",
          value: payload.stateBusinessLicense[0].value,
        },
        {
          type: "w9",
          value: payload.w9[0].value,
        },
        {
          type: "workOrder",
          value: payload.workOrder[0].value,
        },
      ];
      if (payload.contractorLicense[0] && payload.contractorLicense[0].value) {
        docArray.push({
          type: "contractorLicense",
          value: payload.contractorLicense[0].value,
        });
      }
      const request = createFormData("", docArray, userId, screenTrackingId);
      const result = await documentUploadApi(request);
      setLoading(false);
      if (result && !result.error) {
        await changeContractorLastScreen(
          user?.data?.screenTracking?.id,
          stepName.WAITING_FOR_APPROVAL
        );
        moveToNextStep();
      }
    } else {
      setFiles(updatedForm);
    }
  };

  const title = "Upload Documents";
  const note =
    "Easily send us the documents below by taking a photo of them with your mobile device or uploading from your computer.";
  const description1 = "Click the box next to each document to send.";
  const description2 =
    "For multiply pages, just click the box next to the document again to take more photos.";
  const disabled = false;

  return (
    <Container>
      <Loader loading={loading}>
        <Form onSubmit={onSubmitHandler}>
          <Header title={title} note={note} />
          <Notification>
            <img src={attention} alt="attention" />
            <div className="description">
              <p>{description1}</p>
              <p>{description2}</p>
            </div>
          </Notification>
          <FileUploader files={files} setFiles={setFiles} />
          <div>
            <Button type="submit" variant="contained" disabled={!!disabled}>
              Continue
            </Button>
          </div>
        </Form>
      </Loader>
    </Container>
  );
};

export default UploadDocuments;
