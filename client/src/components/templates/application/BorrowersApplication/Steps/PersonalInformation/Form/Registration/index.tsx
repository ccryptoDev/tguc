import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { initForm, renderFields } from "../../config";
import { validateForm, validateDriversLicense } from "../../validation";
import { parseFormToRequest } from "../../../../../../../../utils/parseForm";
import Container from "../../../../styles";
import Loader from "../../../../../../../molecules/Loaders/LoaderWrapper";
import Terms from "../../AgreeWithPolicies";
import Notice from "../../AgreeWithNotice";
import UploadDocuments from "./UploadFiles";
import {
  createNewUserApplication,
  documentUploadApi,
  postInstntDecisionApi,
} from "../../../../../../../../api/application";
import { login } from "../../../../../../../../api/authorization";
import Form from "../styles";
import { formStringToDate } from "../../../../../../../../utils/formats";
import PasswordNote from "../../../../../../../molecules/Form/Elements/PasswordNote";
import {
  InstntProvider,
  useInstntData,
} from "../../../../../../../../contexts/instnt";
import SubmitButton from "../../../../../../../molecules/Buttons/SubmitButton";
import { useUserData } from "../../../../../../../../contexts/user";

// UPLOAD FILES
// REMOVE FILES
// TAKE A PICTURE
// POPULATE USER INFO FORM
// CREATE NEW USER

const FormComponent = ({ moveToNextStep }: { moveToNextStep: any }) => {
  const [form, setForm] = useState(initForm({}));
  const [loading, setLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToNotice, setAgreeToNotice] = useState(false);
  const [files, setFiles] = useState<any>({
    frontSide: "",
    backSide: "",
  });
  const { uploadInstntDocuments, instntError, instntRef, instntDecision } =
    useInstntData();
  const [isFilesError, setIsFilesError] = useState(false);
  const { fetchUser } = useUserData();

  const onSignUpHandler = async () => {
    setLoading(true);

    // CREATE BODY FOR HTTP REQUEST
    const payload = parseFormToRequest(form) as any;

    const { mobilePhone, dateOfBirth } = payload;

    const parsedPayload = {
      ...payload,
      phones: [mobilePhone],
      dateOfBirth: formStringToDate(dateOfBirth),
      source: "web",
    };
    const urlParams = new URLSearchParams(window.location.search);
    const referredBy = urlParams.get("ref");
    if (referredBy) {
      Object.assign(parsedPayload, {
        referredBy,
      });
    }

    const loginPayload = {
      email: payload.email,
      password: payload.password,
    };

    // CREATE APPLICATION
    const authorization: any = await createNewUserApplication(parsedPayload);

    if (authorization && authorization.error) {
      toast.error(authorization.error.message);
      setLoading(false);
      return;
    }

    const { screenTrackingId, userId } = authorization.data;
    if (!screenTrackingId || !userId) {
      toast.error("authorization error");
      setLoading(false);
      return;
    }

    const { formKey, instntjwt, decision } = instntDecision;
    const instntPayload = {
      formKey,
      instntJwt: instntjwt,
      transactionId: instntRef.current.instnttxnid,
      decision,
      screenTrackingId,
    };

    await postInstntDecisionApi(instntPayload);

    // AUTHORIZE TO THE APPLICATION
    const { token, id }: any = await login(loginPayload);
    if (token && id) {
      // CREATE UPLOAD LICENSE BODY

      const documentPayload = {
        documentType: "drivers license",
        driversLicenseFront: files.frontSide,
        driversLicenseBack: files.backSide,
        userId,
        screenTrackingId,
      };
      const document: any = await documentUploadApi(documentPayload);
      if (document && document.data.documentId && !document.error) {
        await fetchUser();
        moveToNextStep();
      } else {
        setForm(document?.error?.message);
      }
    }

    setLoading(false);
  };

  const submitForm = (e: any) => {
    e.preventDefault();
    setLoading(true);
    const [isValid, validatedForm] = validateForm(form);
    const isLicenseValid: boolean = validateDriversLicense(files);

    if (isValid && isLicenseValid) {
      const payload = parseFormToRequest(form) as any;
      uploadInstntDocuments({ form: payload, files });
    } else {
      setForm(validatedForm);
      setIsFilesError(!isLicenseValid);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (instntDecision) {
      onSignUpHandler();
    }
  }, [instntDecision]);

  useEffect(() => {
    if (instntError) {
      toast.error(instntError);
      setLoading(false);
    }
  }, [instntError]);

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevState: any) => ({
      ...prevState,
      [name]: { ...prevState[name], value, message: "" },
    }));
  };

  return (
    <Container>
      <Form onSubmit={submitForm}>
        <div className="fields-wrapper">
          {renderFields(form).map(({ component: Component, ...field }) => {
            return (
              <Component
                key={field.name}
                {...field}
                onChange={onChangeHandler}
              />
            );
          })}
        </div>
        {!form.password.message && (
          <PasswordNote className="textField password-note" />
        )}
        <Loader loading={!instntRef}>
          <div className="file-fields-wrapper">
            <UploadDocuments
              files={files}
              setFiles={setFiles}
              isFilesError={isFilesError}
            />
          </div>
        </Loader>
        <Terms
          value={agreeToTerms}
          onChange={(e: any) => setAgreeToTerms(e.target.value)}
        />
        <Notice
          value={agreeToNotice}
          onChange={(e: any) => setAgreeToNotice(e.target.value)}
        />
        <SubmitButton
          type="submit"
          variant="contained"
          loading={loading}
          disabled={!agreeToTerms || !agreeToNotice}
        >
          Confirm
        </SubmitButton>
      </Form>
    </Container>
  );
};

const Component = (props: any) => {
  return (
    <InstntProvider>
      <FormComponent {...props} />
    </InstntProvider>
  );
};

export default Component;
