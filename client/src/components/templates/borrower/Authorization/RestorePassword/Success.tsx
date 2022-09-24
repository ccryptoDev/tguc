import React from "react";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import { H2 as Heading, Note } from "../../../../atoms/Typography";
import Buttons from "../../../../atoms/Form/Buttons-wrapper";
import Button from "../../../../atoms/Buttons/Button";
import successImg from "../../../../../assets/svgs/success-logo.svg";
import failureImg from "../../../../../assets/svgs/failure-logo.svg";
import { routes } from "../../../../../routes/Borrower/routes";

const Wrapper = styled.div`
  margin: 0 auto;
  .box {
    max-width: 400px;
    width: 100%;
    background: #fff;
    border: 1px solid var(--color-grey-light);
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 20px auto;

    .note {
      margin: 50px 0;
      text-align: left;
    }
    button {
      width: 100%;
    }
  }
`;

const FormComponent = ({ emailResponse, prevPage }: any) => {
  const history = useHistory();
  const success = !emailResponse?.error;

  const buttonHandler = () => {
    if (success) {
      history.push(routes.LOGIN);
    } else {
      prevPage();
    }
  };
  return (
    <Wrapper>
      <div className="box">
        <img src={success ? successImg : failureImg} alt="success" />
        <Note className="note">
          {success
            ? "A new password has been sent to your email."
            : "Something was wrong. Your Email was not verified, please try again"}
        </Note>
        <Buttons>
          <Button type="button" variant="contained" onClick={buttonHandler}>
            {success ? "Log in" : "Retry"}
          </Button>
        </Buttons>
      </div>
    </Wrapper>
  );
};

export default FormComponent;
