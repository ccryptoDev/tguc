import React from "react";
import Layout from "../../layouts/borrower";
import PrivateRoute from "../../routes/Borrower/PrivateRoute";
import Content from "../../components/molecules/PageNotFound";

const NotFound = () => {
  const route = "";
  return (
    <Layout route={route}>
      <PrivateRoute route={route}>
        <Content />
      </PrivateRoute>
    </Layout>
  );
};

export default NotFound;
