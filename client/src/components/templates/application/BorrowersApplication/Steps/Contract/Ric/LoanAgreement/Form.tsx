import React from "react";
import styled from "styled-components";
import { formatDate } from "../../../../../../../../utils/formats";

const Wrapper = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  flex-wrap: wrap;

  .field-wrapper {
    width: 30%;
    padding-bottom: 5%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    & .label {
      margin-bottom: 5px;
      font-size: 14px;
    }
    & .field {
      border-bottom: 1px solid #000;
      min-height: 20px;
      display: flex;
      padding-bottom: 4px;
      align-items: end;
    }
  }

  @media screen and (max-width: 900px) {
    .field-wrapper {
      width: 48%;
    }

    .placeholder-field {
      display: none;
    }
  }

  @media screen and (max-width: 900px) {
    .field-wrapper {
      width: 100%;
    }
  }
`;

const Form = ({
  userData = {},
  date = "",
  screenTracking = {},
  selectedOffer = {},
}: any) => {
  return (
    <Wrapper>
      <div className="field-wrapper">
        <div className="label">Date:</div>
        <div className="field">{formatDate(date)}</div>
      </div>
      <div className="field-wrapper">
        <div className="label">Term:</div>
        <div className="field">{selectedOffer?.term} months</div>
      </div>
      <div className="field-wrapper">
        <div className="label">Amount Financed:</div>
        <div className="field">$2,000</div>
      </div>
      <div className="field-wrapper">
        <div className="label">Borrower Name:</div>
        <div className="field">Temeka Adams</div>
      </div>
      <div className="field-wrapper">
        <div className="label">Borrower Address:</div>
        <div className="field">
          {userData?.street} {userData?.city ? `${userData?.city},` : ""}{" "}
          {userData?.state} {userData?.zipCode}
        </div>
      </div>
      <div className="field-wrapper">
        <div className="label">Loan #:</div>
        <div className="field">{screenTracking?.applicationReference}</div>
      </div>
      {/* <div className="field-wrapper">
        <div className="label">Cosigner Name:</div>
        <div className="field">Patricia Jones</div>
      </div>
      <div className="field-wrapper">
        <div className="label">Cosigner Address:</div>
        <div className="field">8180 Briarwood St Stanton, AL 90680</div>
      </div> */}
      <div className="field-wrapper">
        <div className="label">Service Provider Name:</div>
        <div className="field" />
      </div>
      <div className="field-wrapper">
        <div className="label">Service Provider Address:</div>
        <div className="field" />
      </div>
      <div className="field-wrapper" />
    </Wrapper>
  );
};

export default Form;
