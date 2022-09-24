import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { H3, Text } from "../../../../../atoms/Typography";
import { Email, Phone } from "../../../Components/InfoBoxes";
import { routes } from "../../../../../../routes/Admin/routes.config";

const Wrapper = styled.div`
  .info-wrapper {
    display: flex;
    gap: 1.2rem;
  }

  .link {
    display: inline-block;
  }

  & > p {
    margin: 2.4rem 0;
  }

  @media screen and (max-width: 767px) {
    .info-wrapper {
      flex-wrap: wrap;
    }
  }
`;

const ThankYou = () => {
  return (
    <Wrapper>
      <H3>Congratulations!</H3>
      <Text>
        Thank you for choosing TGUC Financial. We look forward to working with
        you! Please log into your{" "}
        <Link to={routes.DASHBOARD} className="link">
          dealer portal
        </Link>{" "}
        for more information about our programs, procedures, application and
        loan status updates and lead information.
      </Text>
      <div className="info-wrapper">
        <Email />
        <Phone />
      </div>
    </Wrapper>
  );
};

export default ThankYou;
