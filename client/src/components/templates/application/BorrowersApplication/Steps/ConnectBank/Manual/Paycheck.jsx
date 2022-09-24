import React from "react";
import styled from "styled-components";
import PaycheckImg from "../../../../../../../assets/png/paycheck.png";

const Wrapper = styled.div`
  display: flex;
  padding-top: 12px;
  img {
    width: 100%;
  }
`;

const Paymcheck = () => {
  return (
    <Wrapper>
      <img src={PaycheckImg} alt="paycheck" />
    </Wrapper>
  );
};

export default Paymcheck;
