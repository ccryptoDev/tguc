import React from "react";
import Layout from "../../layouts/admin";
import { routes } from "../../routes/Admin/routes.config";
import Table from "../../components/templates/admin/Tables/ManageClients";
import Card from "../../components/atoms/Cards/Large";
import Container from "../../layouts/admin/container";
import { H3 as Heading } from "../../components/atoms/Typography";

const ManageClients = () => {
  return (
    <Layout route={routes.MANAGE_CLIENTS}>
      <Container>
        <Heading style={{ marginBottom: "12px" }}>Manage Clients</Heading>
        <Card>
          <Table />
        </Card>
      </Container>
    </Layout>
  );
};

export default ManageClients;
