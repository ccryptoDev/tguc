import React from "react";
import styled from "styled-components";
import moment from "moment";
import { dateFormat } from "../../../../../../../../utils/formats";
import signatureimg from "../../../../../../../../assets/png/signature.png";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;

  .field-wrapper {
    width: 45%;
    padding-bottom: 5%;

    & .label {
      font-size: 14px;
    }
    & .field {
      border-bottom: 1px solid #000;
      height: 30px;
      padding-bottom: 4px;
      margin-bottom: 5px;
      display: flex;
      align-items: end;

      & img {
        width: 50%;
      }
    }
  }

  .signature-note {
    margin-bottom: 40px;
  }

  @media screen and (max-width: 600px) {
    .field-wrapper {
      width: 100%;
      & .field img {
        height: 200%;
        width: auto;
      }

      &:nth-child(1) {
        order: 2;
      }
      &:nth-child(2) {
        order: 5;
      }
      &:nth-child(3) {
        order: 1;
      }
      &:nth-child(4) {
        order: 4;
      }
      &:nth-child(5) {
        order: 3;
      }
      &:nth-child(6) {
        order: 6;
      }
    }
  }
`;

const Form = ({ signature }: { signature: any }) => {
  return (
    <Wrapper className="no-break">
      <p className="signature-note">
        <b>
          BY SIGNING BELOW ELECTRONICALLY, I CONFIRM THAT I HAVE RECEIVED, READ,
          AND UNDERSTAND THE FEDERAL TRUTH IN LENDING DISCLOSURE AND THIS
          AGREEMENT, THAT I WILL KEEP A COPY OF THE FEDERAL TRUTH IN LENDING
          DISCLOSURE AND OF THIS AGREEMENT FOR MY RECORDS, AND THAT I AGREE TO
          THIS AGREEMENT.
        </b>
      </p>
      <div className="field-wrapper">
        <div className="field">
          {signature ? <img src={signatureimg} alt="user's signature" /> : ""}
        </div>
        <div className="label">Borrower Signature</div>
      </div>
      <div className="field-wrapper">
        <div className="field">
          {signature ? <img src={signatureimg} alt="user's signature" /> : ""}
        </div>
        <div className="label">Cosigner Signature</div>
      </div>
      <div className="field-wrapper">
        <div className="field">Temeka Adams</div>
        <div className="label">Borrower Full Name</div>
      </div>
      <div className="field-wrapper">
        <div className="field">Patricia Jones</div>
        <div className="label">Cosigner Full Name</div>
      </div>
      <div className="field-wrapper">
        <div className="field">{moment().format(dateFormat)}</div>
        <div className="label">Date</div>
      </div>
      <div className="field-wrapper">
        <div className="field">{moment().format(dateFormat)}</div>
        <div className="label">Date</div>
      </div>
    </Wrapper>
  );
};

export default Form;
