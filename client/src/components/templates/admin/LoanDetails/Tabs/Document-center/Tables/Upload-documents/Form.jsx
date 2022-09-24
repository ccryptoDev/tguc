import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Button from "../../../../../../../atoms/Buttons/Button";
import { Form } from "./Styles";
import DocumentType from "./Form-sections/Select-document-type";
import FileFields from "./Form-sections/Inputs-upload-file";
import {
  documentUploadApi,
  getApplication,
} from "../../../../../../../../api/admin-dashboard";
import ErrorMessage from "../../../../../../../molecules/ErrorMessage/FormError";
import Loader from "../../../../../../../molecules/Loaders/LoaderWrapper";
import { docTypes, fieldNames, initForm } from "./config";

const Table = ({ fetchDocs, state }) => {
  const [docType, setDocType] = useState("");
  const [form, setForm] = useState(initForm());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const params = useParams();

  const selectHandler = (e) => {
    setDocType(e.target.value);
    setForm(initForm());
  };

  const getFileData = ({ name, file }) => {
    if (name && file) {
      setForm((prevState) => {
        return {
          ...prevState,
          [name]: { value: file, message: "" },
        };
      });
    }

    if (error) {
      setError("");
    }
  };

  const fetchUser = async (id) => {
    const result = await getApplication(id);
    if (result && !result.error) {
      setUser(result.data.user);
    }
    setLoading(false);
  };
  const disableSubmitButton = () => {
    if (form) {
      if (
        form[fieldNames.licenseFront].value &&
        form[fieldNames.licenseBack].value
      ) {
        return false;
      }
      if (form[fieldNames.passport].value) {
        return false;
      }
      if (form[fieldNames.insurance].value) {
        return false;
      }
      if (form[fieldNames.stateBusinessLicense].value) {
        return false;
      }
      if (form[fieldNames.contractorLicense].value) {
        return false;
      }
      if (form[fieldNames.w9].value) {
        return false;
      }
      if (form[fieldNames.workOrder].value) {
        return false;
      }
    }
    return true;
  };

  // create the multipart document upload format
  const createFormData = (documents) => {
    const userId = user?.id;
    const screenTrackingId = localStorage.getItem("screenTrackingId") || "";
    const formData = {
      documentType: documents.documentType,
      driversLicenseFront: documents.driversLicenseFront,
      driversLicenseBack: documents.driversLicenseBack,
      passport: documents.passport,
      docArray: documents.docArray,
      userId,
      screenTrackingId,
    };
    return formData;
  };

  const parseToRequest = () => {
    switch (docType) {
      case docTypes.PASSPORT:
        return [
          documentUploadApi(
            createFormData({
              documentType: docTypes.PASSPORT,
              passport: form?.passport?.value.text,
            })
          ),
        ];
      case docTypes.DRIVER_LICENSE:
        return [
          documentUploadApi(
            createFormData({
              documentType: `${docTypes.DRIVER_LICENSE}`,
              driversLicenseFront: form?.licenseFront?.value.text,
            })
          ),
          documentUploadApi(
            createFormData({
              documentType: `${docTypes.DRIVER_LICENSE}`,
              driversLicenseBack: form?.licenseBack?.value.text,
            })
          ),
        ];
      case docTypes.INSURANCE:
        return [
          documentUploadApi(
            createFormData({
              documentType: "",
              docArray: [
                {
                  type: "insurance",
                  value: form?.insurance?.value.text,
                },
              ],
            })
          ),
        ];
      case docTypes.STATE_BUSINESS_LICENSE:
        return [
          documentUploadApi(
            createFormData({
              documentType: "",
              docArray: [
                {
                  type: "stateBusinessLicense",
                  value: form?.stateBusinessLicense?.value.text,
                },
              ],
            })
          ),
        ];
      case docTypes.CONTRACTOR_LICENSE:
        return [
          documentUploadApi(
            createFormData({
              documentType: "",
              docArray: [
                {
                  type: "contractorLicense",
                  value: form?.contractorLicense?.value.text,
                },
              ],
            })
          ),
        ];
      case docTypes.W9:
        return [
          documentUploadApi(
            createFormData({
              documentType: "",
              docArray: [
                {
                  type: "w9",
                  value: form?.w9?.value.text,
                },
              ],
            })
          ),
        ];
      case docTypes.WORK_ORDER:
        return [
          documentUploadApi(
            createFormData({
              documentType: "",
              docArray: [
                {
                  type: "workOrder",
                  value: form?.workOrder?.value.text,
                },
              ],
            })
          ),
        ];
      default:
        return [];
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    await Promise.all(parseToRequest());
    await fetchDocs();
    setLoading(false);
  };

  useEffect(() => {
    if (params?.id) {
      fetchUser(params.id);
    }
  }, [params?.id]);

  return (
    <Loader loading={loading}>
      <Form onSubmit={onSubmitHandler}>
        <table>
          <tbody>
            <DocumentType
              selectHandler={selectHandler}
              selectedType={docType}
            />
            {docType ? (
              <FileFields
                type={docType}
                docTypes={docTypes}
                onChange={getFileData}
                fieldNames={fieldNames}
              />
            ) : (
              <tr />
            )}
            <tr>
              <td colSpan="2">
                <div className="submit-button-wrapper">
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={disableSubmitButton()}
                  >
                    Submit
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        {error ? <ErrorMessage message={error} /> : ""}
      </Form>
    </Loader>
  );
};

export default Table;
