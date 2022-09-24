import React from "react";
import styled from "styled-components";
import Tabs from "../Components/Tabs";
import Header from "../Components/Header";
import Section from "./Accordion";
import Financing from "./Financing";
import FinancingDetails from "./FinancingDetails";
import { useUserData } from "../../../../contexts/user";

const Wrapper = styled.div`
  .content {
    padding: 16px;
  }

  .section:not(:last-child) {
    margin-bottom: 12px;
  }
`;

const UserInformation = ({ route }: { route: string }) => {
  const { user } = useUserData();
  const screenTracking = user?.data?.screenTracking;
  const paymentManagement = user?.data?.paymentManagements;
  const name = `${user?.data?.firstName} ${user?.data?.lastName}`;

  const financingData = {
    reference: screenTracking?.applicationReference,
    name,
    status: paymentManagement?.status,
  };

  const financingDetails = {
    amountFinanced: screenTracking?.requestedAmount,
    apr: paymentManagement?.apr,
    financingTerm: "12",
    maturityDate: "09/09/2022",
  };

  return (
    <Wrapper>
      <Tabs activeRoute={route} tabName="Loan Information" />
      <Header>Loan Information</Header>
      <div className="content">
        <Section title="Financing">
          <Financing data={financingData} />
        </Section>
        <Section title="Financing Details">
          <FinancingDetails data={financingDetails} />
        </Section>
      </div>
    </Wrapper>
  );
};

export default UserInformation;
