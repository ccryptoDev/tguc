import React from "react";
import Form from "../../components/templates/admin/Forms/Login/ForgotPassword";
import Layout from "../../layouts/admin/Login";

const RecoverPassword = () => {
  return (
    <Layout heading="Enter your email">
      <Form />
    </Layout>
  );
};

export default RecoverPassword;
