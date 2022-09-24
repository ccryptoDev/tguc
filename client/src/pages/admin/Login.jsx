import React from "react";
import Form from "../../components/templates/admin/Forms/Login/Login";
import Layout from "../../layouts/admin/Login";

const Login = () => {
  return (
    <Layout heading="Sign in to start your session">
      <Form />
    </Layout>
  );
};

export default Login;
