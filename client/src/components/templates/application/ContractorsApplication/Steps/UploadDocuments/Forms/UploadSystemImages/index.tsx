import React from "react";
import {
  add,
  remove,
} from "../../../../../../../molecules/Form/Fields/UploadDocument/methods";
import UploadDocumentField from "../../../../../../../molecules/Form/Fields/UploadDocument";
import { renderFields } from "../../config";

const UploadSystemImages = ({ setFiles, files }: any) => {
  const addFile = (e: any, name: string) => {
    const updatedDocumentsList = add(e);
    setFiles((prevState: any) => ({
      ...prevState,
      [name]: {
        ...prevState[name],
        value: [...prevState[name].value, ...updatedDocumentsList].slice(
          0,
          prevState[name].limit || 1
        ),
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

  const onStateBusinessLicenseRequired = (e: any) => {
    const { name, value } = e.target;
    setFiles((prevState: any) => ({
      ...prevState,
      [name]: { ...prevState[name], required: !value, message: "" },
    }));
  };

  return (
    <div>
      <div className="upload-documents-list">
        {renderFields({ form: files, onStateBusinessLicenseRequired }).map(
          (field: any) => {
            return (
              <UploadDocumentField
                key={field.name}
                name={field.name}
                message={field.message}
                heading={field.heading}
                subheading={field.subheading}
                addFile={addFile}
                files={field.files}
                removeFile={removeFile}
              />
            );
          }
        )}
      </div>
    </div>
  );
};

export default UploadSystemImages;
