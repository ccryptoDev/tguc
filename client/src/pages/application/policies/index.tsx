import React from "react";
import styled from "styled-components";
import PrivacyPolicyConsent from "../../../components/templates/application/Consents/PrivacyPolicy";
import PrivacyNoteConsent from "../../../components/templates/application/Consents/PrivacyNote";
import EconsentComponent from "../../../components/templates/application/Consents/Econsent";
import TermsAndConditionsComponent from "../../../components/templates/application/Consents/TermsAndConditions";
import PageLayout from "../../../layouts/application/Page/Layout";
import { routes } from "../../../routes/Application/routes";
import { H3 } from "../../../components/atoms/Typography";

const Сontainer = styled.div`
  padding: 20px;
  max-width: 8.5in;
  margin: 20px auto;

  & .wrapper {
    background: #fff;
    padding: 20px;

    & .page-heading {
      margin-bottom: 16px;
    }
  }

  @media screen and (max-width: 767px) {
    padding: 0;
    margin: 0;
  }
`;

export const PrivacyPolicy = () => {
  return (
    <PageLayout route={routes.PRIVACY_POLICY}>
      <Сontainer>
        <div className="wrapper">
          <PrivacyPolicyConsent />
        </div>
      </Сontainer>
    </PageLayout>
  );
};

export const PrivacyNote = () => {
  return (
    <PageLayout route={routes.PRIVACY_POLICY}>
      <Сontainer>
        <div className="wrapper">
          <H3 className="page-heading">PRIVACY NOTICE</H3>
          <PrivacyNoteConsent />
        </div>
      </Сontainer>
    </PageLayout>
  );
};

export const Econsent = () => {
  return (
    <PageLayout route={routes.ECONSENT}>
      <Сontainer>
        <div className="wrapper">
          <EconsentComponent />
        </div>
      </Сontainer>
    </PageLayout>
  );
};

export const TermsAndConditions = () => {
  return (
    <PageLayout route={routes.ECONSENT}>
      <Сontainer>
        <div className="wrapper">
          <TermsAndConditionsComponent />
        </div>
      </Сontainer>
    </PageLayout>
  );
};
