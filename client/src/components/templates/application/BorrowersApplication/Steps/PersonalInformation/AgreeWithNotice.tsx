import React from "react";
import styled from "styled-components";
import Modal from "../../../../../organisms/Modal/Regular/ModalAndTriggerButton";
import { Experian } from "../../../Consents";
import Checkbox from "../../../../../molecules/Form/Fields/Checkbox/Custom";

const TermsWrapper = styled.div`
  & {
    display: flex;
  }
  & .terms-text {
    font-size: 1.4rem;
    line-height: 1.5;
    & .modal {
      display: inline-block;
      & > button {
        color: var(--color-blue-1);
        text-decoration: underline;
        cursor: pointer;
        & .button-text {
          font-weight: bold;
        }
      }
    }
  }
`;

const Terms = ({ onChange, value }: { onChange: any; value: boolean }) => {
  return (
    <TermsWrapper className="terms-wrapper">
      <Checkbox value={value} onChange={onChange} />
      <div className="terms-text">
        You understand that by clicking on the I AGREE button immediately
        following this notice you are providing ‘written instructions’ to TGUC
        Financial Inc under the Fair Credit Reporting Act authorizing TGUC
        Financial Inc to obtain information from your personal credit profile or
        other information from Experian and/or TransUnion and/or Equifax. You
        authorize TGUC Financial Inc. to obtain such information solely to:
        prequalify you for credit options.
      </div>
    </TermsWrapper>
  );
};

export default Terms;
