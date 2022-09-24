import React from "react";
import PageLayout from "../../../layouts/application/Page/Layout";
import { routes } from "../../../routes/Application/routes";
import Content from "../../../components/templates/application/ContractorsApplication";

const ApplicationFlow = () => {
  const route = routes.HOME;

  return (
    <PageLayout route={route} bg="contractor">
      <Content />
    </PageLayout>
  );
};

export default ApplicationFlow;
