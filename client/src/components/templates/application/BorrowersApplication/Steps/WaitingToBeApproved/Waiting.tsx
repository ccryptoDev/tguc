import React from "react";
import styled from "styled-components";
import { H3, Text } from "../../../../../atoms/Typography";
import { Email, Phone } from "../../../Components/InfoBoxes";
import Button from "../../../../../atoms/Buttons/Button";
import { useStepper } from "../../../../../../contexts/steps";
import Denied from "./Declined";

const Wrapper = styled.div`
  .info-wrapper {
    display: flex;
    gap: 12px;
  }

  & > p {
    margin: 2.4rem 0;
  }

  button {
    margin-top: 10px;
  }

  @media screen and (max-width: 600px) {
    .info-wrapper {
      flex-wrap: wrap;
    }
  }
`;

const WaitingForApproval = () => {
  const { moveToNextStep } = useStepper();

  return (
    <Wrapper>
      <H3>Congrats!!</H3>
      <Text>
        You have successfully passed necessary steps. Please, check your mail to
        proceed with offers selecting and contract signing.
      </Text>
      <Text>
        Thank you for choosing TGUC Financial. We look forward to working with
        you, so please, contact us in any question, we will be happy to help
        you.
      </Text>
      <div className="info-wrapper">
        <Email />
        <Phone />
      </div>
    </Wrapper>
  );
};

export default WaitingForApproval;
