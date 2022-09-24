import React from "react";
import styled from "styled-components";
import Layout from "../../layouts/admin";
import { routes } from "../../routes/Admin/routes.config";
import Content from "../../components/templates/admin/Forms/ManageRules";
import Card from "../../components/atoms/Cards/Large";
import Container from "../../layouts/admin/container";
import { H3 as Heading } from "../../components/atoms/Typography";

const CardWrapper = styled(Card)`
  overflow: initial;
  padding: 10px;
`;
const ManageClients = () => {
  return (
    <Layout route={routes.MANAGE_RULES}>
      <Container>
        <Heading style={{ marginBottom: "12px" }}>Account Management</Heading>
        <CardWrapper>
          <Content />
        </CardWrapper>
      </Container>
    </Layout>
  );
};

export default ManageClients;
