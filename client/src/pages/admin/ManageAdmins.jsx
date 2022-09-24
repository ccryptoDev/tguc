import React from "react";
import Layout from "../../layouts/admin";
import { routes } from "../../routes/Admin/routes.config";
import Table from "../../components/templates/admin/Tables/ManageAdmins";
import Container from "../../layouts/admin/container";
import { H3 as Heading } from "../../components/atoms/Typography";
import Card from "../../components/atoms/Cards/Large";

const ManageUsers = () => {
  return (
    <Layout route={routes.MANAGE_USERS}>
      <Container>
        <Heading style={{ marginBottom: "12px" }}>Manage Admin</Heading>
        <Card>
          <Table />
        </Card>
      </Container>
    </Layout>
  );
};

export default ManageUsers;
