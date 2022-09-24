import React from "react";
import PageLayout from "../../../layouts/application/Page/Layout";
import { routes } from "../../../routes/Application/routes";
import Content from "../../../components/templates/application/BorrowersApplication";

const ApplicationFlow = () => {
  const route = routes.HOME;
  return (
    <PageLayout route={route}>
      <Content />
    </PageLayout>
  );
};

export default ApplicationFlow;
