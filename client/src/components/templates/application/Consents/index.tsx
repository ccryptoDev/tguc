/* eslint no-underscore-dangle:0 */
import React, { useRef } from "react";
import styled from "styled-components";
import { useReactToPrint } from "react-to-print";
import Button from "../../../atoms/Buttons/Button";
import ESignatureConsentComponent from "./Econsent";
import PrivacyNoteComponent from "./PrivacyNote";
import PrivacyPolicyComponent from "./PrivacyPolicy";
import TermsAndConditionsComponent from "./TermsAndConditions";
import ExperianComponent from "./Experian";

const ModalContainer = styled.div`
  padding: 20px;
  .heading {
    margin-bottom: 20px;
  }

  .form-layout {
    height: 500px;
    overflow-y: scroll;
    padding: 10px;
    .buttons {
      display: flex;
      width: 270px;
      justify-content: space-between;
      padding: 10px;
    }

    .printButton {
      display: block;
      margin: 20px auto 0;
    }
  }

  @page {
    margin: 10mm;
  }

  button {
    &:hover {
      box-shadow: none;
    }
  }

  @media screen and (max-width: 600px) {
    padding: 0;
    .form-layout {
      height: 100%;
    }
  }
`;

const FormComponent = ({ content: TextContent }: { content: any }) => {
  const textContent = useRef<any>();

  const handlePrint = useReactToPrint({
    content: () => textContent.current,
  });

  if (!TextContent) return <></>;
  return (
    <ModalContainer>
      <div className="form-layout">
        <div ref={textContent}>
          <TextContent />
        </div>
        <Button
          type="button"
          className="printButton"
          variant="contained"
          onClick={handlePrint}
        >
          Print
        </Button>
      </div>
    </ModalContainer>
  );
};

export const ESignatureConsent = () => {
  return <FormComponent content={ESignatureConsentComponent} />;
};

export const Experian = () => {
  return <FormComponent content={ExperianComponent} />;
};

export const PrivacyNote = () => {
  return <FormComponent content={PrivacyNoteComponent} />;
};

export const PrivacyPolicy = () => {
  return <FormComponent content={PrivacyPolicyComponent} />;
};

export const TermsAndConditions = () => {
  return <FormComponent content={TermsAndConditionsComponent} />;
};

export default FormComponent;
