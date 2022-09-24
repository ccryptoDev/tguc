import React from "react";
import styled from "styled-components";
import { H3 } from "../../../../atoms/Typography";
import ListItem from "./ListItem";
import UploadFileButton from "../File/Upload-button-style";

const Wrapper = styled.div`
  background: #fff;
  border: 1px solid var(--color-gray-2);
  padding: 2.4rem;
  &.active {
    border: 1px solid var(--color-gray-1);
  }

  .upload-button-wrapper {
    width: 25px;
    display: flex;
    justify-content: center;
  }
  .upload-field {
    display: flex;
    justify-content: space-between;
    column-gap: 1rem;
    & label {
      cursor: pointer;
    }

    &-title {
      & > .note {
        margin: 1.2rem 0;
        color: #58595b;
      }

      & > .message {
        color: red;
      }
    }
  }
`;

const Note = styled.div`
  font-size: 1.4rem;
  line-height: 1.6rem;
  font-weight: 400;
  font-weight: normal;
  color: #222222;
`;

const Field = ({
  files,
  name,
  addFile,
  removeFile,
  heading,
  subheading,
  message = "",
}: {
  files: any[];
  name: string;
  addFile: any;
  removeFile: any;
  heading: string;
  subheading: string;
  message?: string;
}) => {
  return (
    <Wrapper className={`${files.length ? "active" : ""}`}>
      <div className="upload-field">
        <div className="upload-field-title">
          <H3>{heading}</H3>
          <Note className="note">{subheading}</Note>
          {message ? <Note className="note message">{message}</Note> : ""}
        </div>
        <div className="upload-button-wrapper">
          <UploadFileButton name={name} onChange={addFile} />
        </div>
      </div>
      <ul>
        {files.length
          ? files.map((item) => {
              return (
                <ListItem
                  key={item.id}
                  name={item.name}
                  date={item.lastModifiedDate}
                  onRemove={() => removeFile({ fieldname: name, id: item.id })}
                />
              );
            })
          : ""}
      </ul>
    </Wrapper>
  );
};

export default Field;
