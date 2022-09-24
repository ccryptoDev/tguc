import React from "react";
import styled from "styled-components";
import { H3, Text } from "../../../../../atoms/Typography";
import { Email, Phone } from "../../../Components/InfoBoxes";
import { routes } from "../../../../../../routes/Borrower/routes";
import { LinkButton } from "../../../../../atoms/Buttons/Button";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 24px;
  .info-wrapper {
    display: flex;
    gap: 12px;
  }

  @media screen and (max-width: 767px) {
    .heading {
      display: none;
    }
    .info-wrapper {
      flex-wrap: wrap;
    }
  }
`;

const ThankYou = () => {
  return (
    <Wrapper>
      <H3 className="heading">Thank You</H3>
      <Text>All sections were successfully passed!</Text>
      <Text>
        Thank you for choosing TGUC Financial. We look forward to working with
        you, so please, contact us in any question, we will be happy to help
        you.
      </Text>
      <div className="info-wrapper">
        <Email />
        <Phone />
      </div>
      <div>
        <LinkButton to={routes.USER_INFORMATION}>Go to Portal</LinkButton>
      </div>
    </Wrapper>
  );
};

export default ThankYou;
