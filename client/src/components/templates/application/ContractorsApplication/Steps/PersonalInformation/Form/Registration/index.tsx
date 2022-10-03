import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { initForm, renderFields } from "../../config";
import { validateForm, validateDriversLicense } from "../../validation";
import { parseFormToRequest } from "../../../../../../../../utils/parseForm";
import Loader from "../../../../../../../molecules/Loaders/LoaderWrapper";
import Terms from "../../AgreeWithPolicies";
import UploadDocuments from "./UploadFiles";
import {
  createNewContractorApplication,
  documentUploadApi,
  postInstntDecisionApi,
} from "../../../../../../../../api/application";
import { login } from "../../../../../../../../api/authorization";
import Form from "../styles";
import { formStringToDate } from "../../../../../../../../utils/formats";
import PasswordNote from "../../../../../../../molecules/Form/Elements/PasswordNote";
import SubmitButton from "../../../../../../../molecules/Buttons/SubmitButton";
import {
  InstntProvider,
  useInstntData,
} from "../../../../../../../../contexts/instnt";
import { useUserData } from "../../../../../../../../contexts/user";
import { useStepper } from "../../../../../../../../contexts/steps";

const FormComponent = ({ moveToNextStep }: { moveToNextStep: any }) => {
  const [form, setForm] = useState(initForm({}));
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [files, setFiles] = useState<any>({
    frontSide: "",
    backSide: "",
  });
  const { goToStep } = useStepper();
  const { uploadInstntDocuments, instntError, instntRef, instntDecision } =
    useInstntData();
  const [isFilesError, setIsFilesError] = useState(false);
  const { fetchUser } = useUserData();

  const onSignUpHandler = async () => {
    setLoading(true);

    // CREATE BODY FOR HTTP REQUEST
    const payload = parseFormToRequest(form) as any;

    const { phone, dateOfBirth } = payload;

    const parsedPayload = {
      ...payload,
      phones: [phone],
      dateOfBirth: formStringToDate(dateOfBirth),
      source: "web",
    };

    const loginPayload = {
      email: payload.email,
      password: payload.password,
    };

    // CREATE APPLICATION
    const authorization = await createNewContractorApplication(parsedPayload);
    if (authorization && authorization.error) {
      toast.error(authorization.error.message);
      setLoading(false);
      return;
    }

    const { screenTrackingId, userId } = authorization.data;
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
    if (!screenTrackingId || !userId) {
      toast.error("authorization error");
      setLoading(false);
      return;
    }

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
        const userData = await fetchUser();
        if (userData.screenTracking.rulesDetails.loanApproved) {
          moveToNextStep();
        } else {
          goToStep(7);
        }
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
    <Loader loading={loading}>
      <Form onSubmit={submitForm}>
        <div className="contractor-fields-wrapper">
          {renderFields(form).map(({ component: Component, ...field }) => {
            return (
              <Component
                key={field.name}
                {...field}
                onChange={onChangeHandler}
              />
            );
          })}
          {!form.password.message && (
            <PasswordNote className="textField password-note" />
          )}
        </div>

        <UploadDocuments
          files={files}
          setFiles={setFiles}
          isFilesError={isFilesError}
        />

        <Terms
          value={agreed}
          onChange={(e: any) => setAgreed(e.target.value)}
        />
        <SubmitButton
          type="submit"
          variant="contained"
          loading={loading}
          disabled={!agreed}
        >
          Confirm
        </SubmitButton>
      </Form>
    </Loader>
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
