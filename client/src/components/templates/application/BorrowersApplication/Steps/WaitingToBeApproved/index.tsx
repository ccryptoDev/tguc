import React, { useEffect } from "react";
import styled from "styled-components";
import { H3, Text } from "../../../../../atoms/Typography";
import { Email, Phone } from "../../../Components/InfoBoxes";
import { useStepper } from "../../../../../../contexts/steps";
import { useUserData } from "../../../../../../contexts/user";

const Wrapper = styled.div`
  .info-wrapper {
    display: flex;
    gap: 12px;
  }

  & > p {
    margin: 24px 0;
  }

  button {
    margin-top: 10px;
  }

  @media screen and (max-width: 767px) {
    .info-wrapper {
      flex-direction: column;
    }
  }
`;

const WaitingForApproval = () => {
  return (
    <Wrapper>
      <H3>Congrats!!</H3>
      <Text>
        Thank you for your interest in partnering with TGUC Financial for your
        home improvement financing needs. Your application is under review, and
        our team will follow up the status of your request via email within 3
        business days.
      </Text>
      <div className="info-wrapper">
        <Email />
        <Phone />
      </div>
    </Wrapper>
  );
};

export default WaitingForApproval;
