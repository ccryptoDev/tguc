import React from "react";
import styled from "styled-components";
import Layout from "../../layouts/admin";
import { routes } from "../../routes/Admin/routes.config";
import Card from "../../components/atoms/Cards/Large";
import Form from "../../components/templates/admin/Forms/ChangePassword/Form";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  .card {
    display: flex;
    padding: 2rem;
  }
`;

const ResetPasswordPage = () => {
  return (
    <Layout route={routes.RESET_PASSWORD}>
      <Wrapper>
        <Card className="card">
          <Form />
        </Card>
      </Wrapper>
    </Layout>
  );
};

export default ResetPasswordPage;
