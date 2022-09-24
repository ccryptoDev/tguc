import React from "react";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import { H3, Text } from "../../../../../atoms/Typography";
import { Email, Phone } from "../../../Components/InfoBoxes";
import logo from "../../../../../../assets/svgs/failure-logo.svg";
import Button from "../../../../../atoms/Buttons/Button";
import { routes } from "../../../../../../routes/Application/routes";

const Wrapper = styled.div`
  .info-wrapper {
    display: flex;
    gap: 12px;
  }

  .reasons {
    padding-left: 2rem;
  }

  & > p,
  img {
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

const Denied = () => {
  const history = useHistory();
  return (
    <Wrapper>
      <H3>Loan Declined</H3>
      <img src={logo} alt="success" className="logo" />
      <Text>
        We are sorry, but we are unable to approve your request for financing.
        More information regarding this decision will be delivered to the email
        address provided on the credit application.
      </Text>
      <div className="info-wrapper">
        <Email />
        <Phone />
      </div>
      <Button
        type="button"
        variant="contained"
        onClick={() => history.push(routes.HOME)}
      >
        To Home
      </Button>
    </Wrapper>
  );
};

export default Denied;
