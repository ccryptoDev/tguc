import React from "react";
import styled from "styled-components";
import { H3, Note } from "../../../../../atoms/Typography";
import logo from "../../../../../../assets/svgs/success-logo.svg";
import Button from "../../../../../atoms/Buttons/Button";
import { useStepper } from "../../../../../../contexts/steps";
import { Email, Phone } from "../../../Components/InfoBoxes";

const Wrapper = styled.div`
  .info-wrapper {
    display: flex;
    gap: 12px;
  }
  .note {
    margin: 12px 0;
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

const SuccessMessage = () => {
  const { moveToNextStep } = useStepper();

  return (
    <Wrapper>
      <H3>Congratulations!</H3>
      <Note className="note">You have been pre approved!</Note>
      <img src={logo} alt="success" className="logo" />
      <Note className="note">
        Thank you for choosing TGUC Financial. We look forward to working with
        you, so please, contact us in any question, we will be happy to help
        you.
      </Note>
      <div className="info-wrapper">
        <Email />
        <Phone />
      </div>
      <Button onClick={moveToNextStep} type="button" variant="contained">
        Continue Application
      </Button>
    </Wrapper>
  );
};

export default SuccessMessage;
