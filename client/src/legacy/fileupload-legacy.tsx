import React, { useState } from "react";
import { BrowserView, MobileView } from "react-device-detect";
import Button from "../components/atoms/Buttons/Button";
import { initForm, renderFields } from "../components/templates/application/BorrowersApplication/Steps/PersonalInformation/config";
import { validateForm } from "../components/templates/application/BorrowersApplication/Steps/PersonalInformation/validation";
import { validateFiles } from "../utils/validators/files";
import { parseFormToRequest } from "../utils/parseForm";
import Header from "../components/templates/application/Components/FormHeader";
import Container from "../components/templates/application/BorrowersApplication/styles";
import Loader from "../components/molecules/Loaders/LoaderWrapper";
import Terms from "../components/templates/application/BorrowersApplication/Steps/PersonalInformation/AgreeWithPolicies";
import Notice from "../components/templates/application/BorrowersApplication/Steps/PersonalInformation/AgreeWithNotice";
import {
  add,
  remove,
  applyLimit,
} from "../components/molecules/Form/Fields/UploadDocument/methods";
import UploadDocumentsField from "../components/molecules/Form/Fields/UploadDocument";
import { createNewUserApplication } from "../api/application";
import { login } from "../api/authorization";
import { useUserData } from "../contexts/user";
import Form from "../components/templates/application/BorrowersApplication/Steps/PersonalInformation/Form/styles";
import { formStringToDate } from "../utils/formats";

// UPLOAD FILES
// REMOVE FILES
// TAKE A PICTURE
// POPULATE USER INFO FORM
// CREATE NEW USER

export const initFilesForm = () => {
  return {
    driversLicense: { value: [], message: "", required: true, limit: 2 },
  };
};

const FormComponent = ({ moveToNextStep }: { moveToNextStep: any }) => {
  const [form, setForm] = useState(initForm({}));
  const [loading, setLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToNotice, setAgreeToNotice] = useState(false);
  const [files, setFiles] = useState<any>(initFilesForm());
  const { fetchUser } = useUserData();

  const addFile = (e: any, name: string) => {
    const updatedDocumentsList = add(e);
    const updatedFilesList = applyLimit({
      array: [...updatedDocumentsList, ...files[name].value],
      limit: files[name].limit,
    });
    setFiles((prevState: any) => ({
      ...prevState,
      [name]: {
        ...prevState[name],
        value: updatedFilesList,
        message: "",
      },
    }));
  };

  const removeFile = ({ fieldname, id }: { fieldname: string; id: string }) => {
    const updatedList = remove({ files: files[fieldname].value, id });
    setFiles((prevState: any) => ({
      ...prevState,
      [fieldname]: { ...prevState[fieldname], value: updatedList },
    }));
  };

  function setUserInfoInTheContext(response: any = {}) {
    const { user: userId = "", id: screenTrackingId = "" } =
      response?.data?.data?.screentracking || {};
    if (userId && screenTrackingId) {
      localStorage.setItem("userId", userId);
      localStorage.setItem("screenTrackingId", screenTrackingId);
    }
  }

  const onSubmitHandler = async (e: any) => {
    e.preventDefault();
    const [isValid, validatedForm] = validateForm(form);
    const [isValidFiles, validatedFiles] = validateFiles(files);

    if (isValid && isValidFiles) {
      setLoading(true);
      const payload = parseFormToRequest(validatedForm) as any;

      const { mobilePhone, dateOfBirth } = payload;

      const parsedPayload = {
        ...payload,
        phones: [mobilePhone],
        dateOfBirth: formStringToDate(dateOfBirth),
        source: "web",
      };

      const loginPayload = {
        email: payload.email,
        password: payload.password,
      };

      await createNewUserApplication(parsedPayload).then(
        setUserInfoInTheContext
      );
      const { token, id }: any = await login(loginPayload);
      if (token && id) {
        const user = await fetchUser();
        if (user && user.screenTracking && user.screenTracking.id) {
          // THIS WILL CHANGE ACTIVE STEP IN THE STEPPER OBJECT
          moveToNextStep();
        }
      }

      setLoading(false);
    } else {
      setForm(validatedForm);
      setFiles(validatedFiles);
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
          <Header
            title="Personal Information"
            note="This will not affect your credit score"
          />
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
          <div className="file-fields-wrapper">
            <UploadDocumentsField
              name="driversLicense"
              message={files.driversLicense.message}
              heading="Driver's License"
              subheading="Please upload a copy of the front and back of your driver's license."
              addFile={addFile}
              files={files.driversLicense.value}
              removeFile={removeFile}
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
