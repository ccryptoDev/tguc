import React from "react";
import styled from "styled-components";
import Form from "./Form";
import Introduction from "./Introduction";
import Agreement from "./Agreement";

const Wrapper = styled.div`
  .heading {
    margin-bottom: 20px;
  }
  .creditor-field {
    width: 290px;
    padding-bottom: 5%;
    margin-left: auto;
    display: flex;
    align-items: start;

    & .label {
      font-size: 14px;
      margin-right: 5px;
    }

    & .field {
      border-bottom: 1px solid #000;
      flex-grow: 1;
      display: flex;
      align-items: start;
    }

    & .label,
    & .field {
      padding: 4px 0;
      min-height: 20px;
    }
  }
`;

const LoanAgreement = () => {
  return (
    <Wrapper>
      <div className="creditor-field">
        <div className="label">Creditor:</div>
        <div className="field">TGUC Financial</div>
      </div>
      <div className="heading text-center">
        <b>LOAN AGREEMENT</b>
      </div>
      <Form />
      <Introduction />
      <Agreement />
    </Wrapper>
  );
};

export default LoanAgreement;
