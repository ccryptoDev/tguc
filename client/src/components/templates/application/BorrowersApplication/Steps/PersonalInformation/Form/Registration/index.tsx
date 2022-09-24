import React, { useState } from "react";
import { toast } from "react-toastify";
import Button from "../../../../../../../atoms/Buttons/Button";
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
} from "../../../../../../../../api/application";
import { login } from "../../../../../../../../api/authorization";
import Form from "../styles";
import { formStringToDate } from "../../../../../../../../utils/formats";
import PasswordNote from "../../../../../../../molecules/Form/Elements/PasswordNote";

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
  const [isFilesError, setIsFilesError] = useState(false);

  const onSubmitHandler = async (e: any) => {
    e.preventDefault();
    // VALIDATE FORM DATA
    const [isValid, validatedForm] = validateForm(form);

    // VALIDATE LICENSE IMAGES
    const licenseValidationError: boolean = validateDriversLicense(files);

    if (isValid && !licenseValidationError) {
      setLoading(true);

      // CREATE BODY FOR HTTP REQUEST
      const payload = parseFormToRequest(validatedForm) as any;

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
          moveToNextStep();
        } else {
          setForm(document?.error?.message);
        }
      }

      setLoading(false);
    } else {
      setForm(validatedForm);
      setIsFilesError(licenseValidationError);
    }
  };

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevState: any) => ({
      ...prevState,
      [name]: { ...prevState[name], value, message: "" },
    }));
  };

  return (
    <Container>
      <Loader loading={loading}>
        <Form onSubmit={onSubmitHandler}>
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
          <div className="file-fields-wrapper">
            <UploadDocuments
              files={files}
              setFiles={setFiles}
              isFilesError={isFilesError}
            />
          </div>
          <Terms
            value={agreeToTerms}
            onChange={(e: any) => setAgreeToTerms(e.target.value)}
          />
          <Notice
            value={agreeToNotice}
            onChange={(e: any) => setAgreeToNotice(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={!agreeToTerms || !agreeToNotice}
          >
            Confirm
          </Button>
        </Form>
      </Loader>
    </Container>
  );
};

export default FormComponent;
