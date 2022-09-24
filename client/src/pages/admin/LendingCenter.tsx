import React from "react";
import Layout from "../../layouts/admin";
import { routes } from "../../routes/Admin/routes.config";
import { tFilter, tStatus } from "../../utils/variables";
import Table from "../../components/organisms/Table/With-filters";
import { AgentsTableStyle } from "../../components/atoms/Table/Table-paginated";
import Container from "../../layouts/admin/container";
import { H3 as Heading } from "../../components/atoms/Typography";
import Card from "../../components/atoms/Cards/Large";
import Rows from "../../components/templates/admin/Tables/LoanApplications/Rows";
import Thead from "../../components/templates/admin/Tables/LoanApplications/Thead";
import { getLoans } from "../../api/admin-dashboard";

type IfiltersInit = {
  name: string;
  active: boolean;
  status: string | string[];
}[];

// SET THE TABLE FILTER TABS CONFIG
const filtersInit: IfiltersInit = [
  { name: tFilter.ALL, active: true, status: tStatus.ALL },
  { name: tFilter.PAID, active: false, status: tStatus.PAID },
  { name: tFilter.IN_REPAYMENT, active: false, status: tStatus.IN_REPAYMENT },
];

const LCenter = () => {
  return (
    <Layout route={routes.LENDING_CENTER}>
      <Container>
        <Heading style={{ marginBottom: "12px" }}>Lending Center</Heading>
        <Card>
          <AgentsTableStyle>
            <Table
              rows={Rows}
              thead={Thead}
              api={getLoans}
              filtersInit={filtersInit}
              initStatus={tStatus.ALL}
            />
          </AgentsTableStyle>
        </Card>
      </Container>
    </Layout>
  );
};

export default LCenter;
