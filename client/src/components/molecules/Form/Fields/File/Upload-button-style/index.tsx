import React from "react";
import styled from "styled-components";
import uploadIcon from "../../../../../../assets/svgs/upload.svg";

const Wrapper = styled.div`
  label {
    cursor: pointer;
  }
`;

type IUploadFileButton = {
  name: string;
  onChange: any;
  accept?: string;
};

const FileUploader = ({
  name,
  onChange,
  accept = "file/*",
}: IUploadFileButton) => {
  return (
    <Wrapper>
      <label htmlFor={name}>
        <input
          accept={accept}
          hidden
          id={name}
          type="file"
          name={name}
          multiple
          onChange={(e) => onChange(e, name)}
        />
        <span>
          <img src={uploadIcon} alt="upload" />
        </span>
      </label>
    </Wrapper>
  );
};

export default FileUploader;
