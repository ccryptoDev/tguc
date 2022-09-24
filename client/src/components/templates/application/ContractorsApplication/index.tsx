import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import Stepper from "../../../organisms/Stepper";
import { StepperProvider } from "../../../../contexts/steps";
import { steps } from "./Steps";
import { useUserData } from "../../../../contexts/user";
import { parseStepNames } from "./Steps/config";
import { routes } from "../../../../routes/Application/routes";

const Wrapper = styled.div`
  width: 100%;
  padding: 20px 0;
  margin: 0 auto;
  box-sizing: border-box;

  & > .page-heading-wrapper {
    margin-bottom: 50px;
    & .note-wrapper {
      display: flex;
      align-items: center;
      margin-bottom: 28px;

      & img {
        margin-right: 16px;
      }
    }
    & h1 {
      font-size: 56px;
      line-height: 62px;
      font-weight: 700;
    }
  }

  @media screen and (max-width: 900px) {
    padding: 0;
  }

  @media screen and (max-width: 767px) {
    & > .page-heading-wrapper .heading {
      font-size: 32px;
      line-height: 36px;
    }
  }
`;

const Steps = () => {
  return (
    <Wrapper className="page-contentainer">
      <Stepper />
    </Wrapper>
  );
};

const Application = () => {
  const { lastScreen, isAuthorized, user, loading } = useUserData();
  const [initStep, setInitStep] = useState(0);
  const history = useHistory();

  useEffect(() => {
    if (!loading) {
      if (isAuthorized) {
        // SECURE CONTRACTOR URL
        if (
          user?.data?.screenTracking?.isContractor &&
          user?.data?.screenTracking?.id
        ) {
          history.push(
            `${routes.APPLY_CONTRACTOR}${user?.data?.screenTracking?.id}`
          );
        } else {
          history.push(
            `${routes.APPLY_BORROWER}${user?.data?.screenTracking?.id}`
          );
        }
        setInitStep(parseStepNames(lastScreen));
      } else if (!isAuthorized && !user.data) {
        setInitStep(1);
      }
    }
  }, [loading, isAuthorized]);

  return (
    <StepperProvider steps={steps} initStep={initStep}>
      <Steps />
    </StepperProvider>
  );
};

export default Application;
