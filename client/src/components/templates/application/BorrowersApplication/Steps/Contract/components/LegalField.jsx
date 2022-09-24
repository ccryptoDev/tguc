import React from "react";
import styled from "styled-components";
import { Text } from "../../../../../../atoms/Typography";

const FieldWrapper = styled.div`
  display: flex;
  align-items: center;
  column-gap: 16px;
  flex-wrap: nowrap;
  & .label p {
    font-weight: 700;
    white-space: nowrap;
  }
  & .value {
    height: 40px;
    padding: 8px 0;
    box-sizing: border-box;
    position: relative;
    border-bottom: 1px solid var(--color-gray-2);
    width: 100%;
    display: flex;
    align-items: center;
    & img {
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      left: 50%;
      max-height: 70px;
    }
  }

  @media screen and (max-width: 767px) {
      row-gap: 24px;

        & img {
          max-width: 90%;
        }
      }
    }
  }
  @media screen and (max-width: 560px) {
    & .field-wrapper .label {
      max-width: 100px;
    }
  }
`;

const LegalField = ({ label = "", value = "" }) => {
  return (
    <FieldWrapper className="legal-field">
      <div className="label">
        <Text>{label}</Text>
      </div>
      <div className="value">{value}</div>
    </FieldWrapper>
  );
};

export default LegalField;
