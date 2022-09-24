import React from "react";
import Layout from "../../layouts/admin";
import Details from "../../components/templates/admin/UserDetails";
import { H3 as Heading } from "../../components/atoms/Typography";
import Container from "../../layouts/admin/container";

const DetailsPage = () => {
  return (
    <Layout>
      <Container>
        <Heading>User Details</Heading>
        <Details />
      </Container>
    </Layout>
  );
};

export default DetailsPage;
