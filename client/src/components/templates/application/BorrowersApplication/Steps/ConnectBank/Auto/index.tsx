import React, { useEffect, useState } from "react";
import styled from "styled-components";
import PlaidLink from "react-plaid-link";
import { Form, BankLogo } from "../styles";
import Button from "../../../../../../atoms/Buttons/Button";
import { logoes } from "../logoes";
import Header from "../../../../Components/FormHeader";
import PlaidButton from "./Plaid";
import bgfog from "../../../../../../../assets/svgs/BankLogo/bg-fog.svg";

const LogoesWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 12px;
  margin: 24px 0;

  & .btn-manual {
    margin-top: 24px;
  }

  @media screen and (max-width: 500px) {
    & {
      margin: 12px 0;
    }
    .logo img {
      max-width: 80%;
    }

    grid-gap: 2px;
  }
`;

const ButtonsWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;

  @media screen and (max-width: 450px) {
    flex-direction: column;
  }
`;

const BackgroundWrapper = styled.div`
  position: relative;

  .bg-fog {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
  }

  .buttons-wrapper {
    position: absolute;
    bottom: 0;
  }
  @media screen and (max-width: 767px) {
    .bg-fog {
      display: none;
    }
  }
`;

const ChooseProviderForm = ({
  setActiveTab,
  setConnected,
  tabType,
}: {
  setActiveTab: any;
  setConnected: any;
  tabType: { AUTO: string; MANUAL: string };
}) => {
  const onSubmitHandler = () => {
    console.log("login to bank");
    setConnected(true);
  };

  const title = "Connect your bank";
  const note =
    "Please choose the account where your monthly income is deposited.";

  return (
    <Form onSubmit={onSubmitHandler}>
      <Header title={title} note={note} />
      <BackgroundWrapper className="background-wrapper">
        <LogoesWrapper className="bank-logoes">
          {logoes.map((logo) => (
            <BankLogo key={logo.name} className="logo">
              <img src={logo.img} alt={logo.name} />
            </BankLogo>
          ))}
        </LogoesWrapper>
        <img src={bgfog} alt="" className="bg-fog" />
        <ButtonsWrapper className="buttons-wrapper">
          <PlaidButton cb={onSubmitHandler} />
          <Button
            type="button"
            variant="outlined"
            onClick={() => setActiveTab(tabType.MANUAL)}
            className="btn-manual"
          >
            Connect Manually
          </Button>
        </ButtonsWrapper>
      </BackgroundWrapper>
    </Form>
  );
};

export default ChooseProviderForm;
