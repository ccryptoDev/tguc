import React from "react";
import { H3 } from "../../../../../../../../atoms/Typography";
import UploadFileButton from "../../../../../../../../molecules/Form/Fields/File/Upload-button-style";
import RemoveFileBtn from "../../../../../../../../molecules/Form/Fields/File/Remove-button";
import FileField from "./Components/DocumentField";
import Wrapper from "./styles";
import { add } from "../../../../../../../../molecules/Form/Fields/UploadDocument/methods";
import { getBase64 } from "../../../../../../../../../utils/base64";

const Uploader = ({ files, setFiles, isFilesError }: any) => {
  const addFile = async (e: any, name: string) => {
    const updatedDocumentsList = add(e);
    const file = updatedDocumentsList[0];
    // ALLOW IMAGES ONLY
    if (file && /(image)/.test(file.type)) {
      const res = await getBase64(file);
      setFiles((prevState: any) => ({
        ...prevState,
        [name]: res,
      }));
    }
  };

  const removeFile = (name: string) => {
    setFiles((prevState: any) => ({
      ...prevState,
      [name]: "",
    }));
  };

  const renderButton = ({
    name,
    isFileUploaded,
  }: {
    name: string;
    isFileUploaded: boolean;
  }) =>
    isFileUploaded ? (
      <RemoveFileBtn onClick={() => removeFile(name)} />
    ) : (
      <UploadFileButton
        accept="image/png, image/jpeg"
        name={name}
        onChange={(e: any) => addFile(e, name)}
      />
    );

  const isFrontSideUploaded = !!files?.frontSide;
  const isBackSideUploaded = !!files?.backSide;

  const frontSideLabel = isFrontSideUploaded ? (
    "front-side of the driver's license"
  ) : (
    <span className="placeholder">Front side</span>
  );

  const backSideLabel = isBackSideUploaded ? (
    "back-side of the driver's license"
  ) : (
    <span className="placeholder">Back side</span>
  );

  return (
    <Wrapper>
      <H3 className="heading">Driver&apos;s License</H3>
      <p className={`note ${isFilesError ? "error" : ""}`}>
        Please upload a copy of the front and back of your driver&apos;s
        license.
      </p>
      <ul>
        <FileField
          label={frontSideLabel}
          button={renderButton({
            name: "frontSide",
            isFileUploaded: isFrontSideUploaded,
          })}
        />
        <FileField
          label={backSideLabel}
          button={renderButton({
            name: "backSide",
            isFileUploaded: isBackSideUploaded,
          })}
        />
      </ul>
    </Wrapper>
  );
};

export default Uploader;
