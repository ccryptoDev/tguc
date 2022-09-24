import React from "react";
import styled from "styled-components";
import imageIcon from "../../../../../../../../../../assets/png/image-icon.png";

const Field = styled.li`
  display: flex;
  justify-content: space-between;
  column-gap: 1rem;
  &:not(:first-child) {
    margin-top: 1.2rem;
  }

  .file {
    &-info-wrapper {
      display: flex;
      align-items: center;
      column-gap: 1.2rem;
    }

    &-icon {
      height: 1.8rem;
      width: 2.1rem;
    }

    &-name {
      color: var(--color-primary);
      margin-bottom: 2px;
    }

    &-date {
      color: var(--color-grey-light);
      font-size: 10px;
      line-height: 12px;
    }
  }
  .buttons-wrapper {
    display: flex;
    justify-content: center;
    width: 25px;
  }

  .placeholder {
    font-size: 12px;
    color: var(--color-grey-1);
  }
  .note {
    font-size: 1.4rem;
    line-height: 1.6rem;
    font-weight: 400;
    font-weight: normal;
    color: #222222;
  }
`;

const FileField = ({ label, button }) => {
  return (
    <Field>
      <div className="file-info-wrapper">
        <img src={imageIcon} alt="front-side" className="file-icon" />
        <div className="file-name-box">
          <p className="file-name note">{label}</p>
        </div>
      </div>
      <div className="buttons-wrapper">{button}</div>
    </Field>
  );
};

export default FileField;
