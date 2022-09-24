import React from "react";
import moment from "moment";
import styled from "styled-components";
import { H4 } from "../../../components/atoms/Typography";
import ContractDetails from "./UserInfo";
import TruthInLending from "./Truth-in-lending";
import Itemization from "./Itemization";
import Header from "./Header";
import ArbitrationAgreement from "./ArbitrationAgreement";
import Clarifications from "./Clarifications";
import Acknowledgement from "./Acknowledgement";
import AdditionalTnC from "./AdditionalTnC";
import ElectronicPaymentAuth from "./ElectronicPaymentAuth";
import BankAccount from "./BankAccount";
import SignTnC from "./SignTnC";

const Wrapper = styled.div`
  border: 1px solid var(--color-gray-1);
  .section-wrapper {
    padding: 24px;
    border-bottom: 1px solid var(--color-gray-1);

    & > article:not(:last-child) {
      padding-bottom: 24px;
    }
  }
`;

const Ric = ({
  ricData = {},
  loanData = null,
  user = null,
  loading,
  addSignature,
}) => {
  const maturityDate =
    moment(ricData?.whenPaymentsAreDue).utc().format("M/D/YYYY") || "--";
  const offer = loanData?.screenTracking?.offerData || {};
  return (
    <Wrapper>
      <div className="section-wrapper">
        <Header />
      </div>
      <div className="section-wrapper">
        <H4 className="mb-24">Retail installment sale contract</H4>
        <article>
          <ContractDetails ricData={ricData} />
        </article>
        <article>
          <Clarifications />
        </article>
        <article>
          <TruthInLending
            loanData={loanData}
            maturityDate={maturityDate}
            offer={offer}
          />
        </article>
        <article>
          <Itemization />
        </article>
        <article>
          <Acknowledgement addSignature={addSignature} />
        </article>
        <article>
          <AdditionalTnC />
        </article>
      </div>
      <div className="section-wrapper">
        <article>
          <ElectronicPaymentAuth />
        </article>
        <article>
          <BankAccount />
        </article>
        <article>
          <SignTnC addSignature={addSignature} />
        </article>
      </div>
      <div className="section-wrapper">
        <article>
          <ArbitrationAgreement />
        </article>
        <article>
          <SignTnC addSignature={addSignature} />
        </article>
      </div>
    </Wrapper>
  );
};

export default Ric;
