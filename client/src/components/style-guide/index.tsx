import React from "react";
import styled from "styled-components";
import Container from "./Container";
import Typography from "./Typography";
import LogoTGUC from "../../assets/svgs/Logo/Logo-TGUC-financial.svg";
import Logo from "../../assets/svgs/Logo/Logo.svg";
import Colors from "./Colors";
import Buttons from "./Buttons";
import Links from "./Links";
import Inputs from "./Inputs";
import success from "../../assets/svgs/success-logo.svg";
import Policy from "../templates/application/Consents/PrivacyPolicy";

const Wrapper = styled.div`
  padding: 50px;
  .row {
    display: flex;
    column-gap: 20px;
    row-gap: 20px;
    margin-bottom: 20px;
  }
`;

const Guide = () => {
  return (
    <Wrapper>
      <div className="row">
        <Container sectionName="Fonts and Headers">
          <Typography />
        </Container>
        <Container sectionName="Logotypes">
          <img src={LogoTGUC} alt="logo-TGUC-financial" />
          <img src={Logo} alt="logo" />
          <img src={success} alt="" />
        </Container>
        <Container sectionName="Colors">
          <Colors />
        </Container>
        <Container sectionName="Buttons">
          <Buttons />
        </Container>
        <Container sectionName="Links">
          <Links />
        </Container>
      </div>
      <div className="row">
        <Container sectionName="Inputs">
          <Inputs />
        </Container>
      </div>
      <Policy />
    </Wrapper>
  );
};

export default Guide;
