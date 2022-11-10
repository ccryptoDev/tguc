import React from "react";
import moment from "moment";
import TruthInLending from "./Truth-in-lending";
import LoanAgreement from "./LoanAgreement";
import Wrapper from "./styles";
import Itemization from "./Itemization";
import SignatureForm from "./SignatureForm";

const Ric = ({ ricData = {}, signature }) => {
  const maturityDate = "09/09/2022";

  return (
    <Wrapper>
      <div className="section">
        <TruthInLending {...ricData} />
      </div>
      <div className="section">
        <Itemization />
      </div>
      <div className="section">
        <LoanAgreement {...ricData} />
      </div>
      <div className="section">
        <SignatureForm signature={signature} />
      </div>
    </Wrapper>
  );
};

export default Ric;
