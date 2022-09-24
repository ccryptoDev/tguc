import React from "react";
import styled from "styled-components";
import Modal from "../../../../../organisms/Modal/Regular/ModalAndTriggerButton";
import {
  PrivacyNote,
  ESignatureConsent,
  PrivacyPolicy,
  TermsAndConditions,
} from "../../../Consents";
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
        By checking this I agree that I have read, understood and consent to
        TGUC&apos;s &nbsp;
        <Modal
          button={<div className="button-text">Privacy Policy</div>}
          modalContent={PrivacyPolicy}
          modalTitle="Privacy Policy"
        />
        ,&nbsp;
        <Modal
          button={<div className="button-text">Privacy Notice</div>}
          modalContent={PrivacyNote}
          modalTitle="Privacy Notice"
        />
        ,&nbsp;
        <Modal
          button={<div className="button-text">E-Consent</div>}
          modalContent={ESignatureConsent}
          modalTitle="E-Consent"
        />
        &nbsp;and&nbsp;
        <Modal
          button={<div className="button-text">Terms of Use</div>}
          modalContent={TermsAndConditions}
          modalTitle="Terms of Use"
        />
      </div>
    </TermsWrapper>
  );
};

export default Terms;
