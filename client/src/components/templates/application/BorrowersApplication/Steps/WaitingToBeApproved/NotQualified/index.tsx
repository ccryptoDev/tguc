import React, { useState } from "react";
import styled from "styled-components";
import Button from "../../../../../../atoms/Buttons/Button";
import { validateFiles } from "./validate";
import Header from "../../../../Components/FormHeader";
import Container from "../../../styles";
import { mockRequest } from "../../../../../../../utils/mockRequest";
import Loader from "../../../../../../molecules/Loaders/LoaderWrapper";

import {
  add,
  remove,
  applyLimit,
} from "../../../../../../molecules/Form/Fields/UploadDocument/methods";
import UploadDocumentsField from "../../../../../../molecules/Form/Fields/UploadDocument";

const Form = styled.form`
  .file-fields-wrapper {
    margin: 20px 0;
  }
`;

const initFilesForm = () => {
  return {
    documents: { value: [], message: "", required: true, limit: 2 },
  };
};

const FormComponent = () => {
  const [loading, setLoading] = useState(false);

  const [files, setFiles] = useState<any>(initFilesForm());

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

  const onSubmitHandler = async (e: any) => {
    e.preventDefault();

    const [isValidFiles, validatedFiles] = validateFiles(files);

    if (isValidFiles) {
      setLoading(true);
      await mockRequest();
      setLoading(false);
    } else {
      setFiles(validatedFiles);
    }
  };

  return (
    <Container>
      <Loader loading={loading}>
        <Form onSubmit={onSubmitHandler}>
          <Header
            title="Add more information"
            note="Your application did not meet our initial pre-qualification criteria. More information is needed to qualify your loan request. Please upload two months of bank statements OR provide access to view your bank account  through our secure integration.  "
          />
          <div className="file-fields-wrapper">
            <UploadDocumentsField
              name="documents"
              message={files.documents.message}
              heading="Bank statements"
              subheading="Upload two months of bank statements."
              addFile={addFile}
              files={files.documents.value}
              removeFile={removeFile}
            />
          </div>

          <Button
            type="submit"
            variant="contained"
            disabled={files?.bankStatements?.length}
          >
            Confirm
          </Button>
        </Form>
      </Loader>
    </Container>
  );
};

export default FormComponent;
