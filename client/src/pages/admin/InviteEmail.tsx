import React from "react";
import styled from "styled-components";
import Layout from "../../layouts/admin";
import { routes } from "../../routes/Admin/routes.config";
import Card from "../../components/atoms/Cards/Large";
import Form from "../../components/templates/admin/Forms/InviteEmail/Form";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  .card {
    display: flex;
    padding: 2rem;
  }
`;

const InviteEmailPage = () => {
  return (
    <Layout route={routes.INVITE_EMAIL}>
      <Wrapper>
        <Card className="card">
          <Form />
        </Card>
      </Wrapper>
    </Layout>
  );
};

export default InviteEmailPage;
