import React from "react";
import Layout from "../../layouts/admin";
import { routes } from "../../routes/Admin/routes.config";
import Table from "../../components/templates/admin/Tables/ManageAgents";
import Container from "../../layouts/admin/container";
import { H3 as Heading } from "../../components/atoms/Typography";
import Card from "../../components/atoms/Cards/Large";

const ManageUsers = () => {
  return (
    <Layout route={routes.MANAGE_AGENTS}>
      <Container>
        <Heading style={{ marginBottom: "12px" }}>Manage Agents</Heading>
        <Card>
          <Table />
        </Card>
      </Container>
    </Layout>
  );
};

export default ManageUsers;
