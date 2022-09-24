import React from "react";
import Layout from "../../layouts/admin";
import { routes } from "../../routes/Admin/routes.config";
import Table from "../../components/organisms/Table/With-filters";
import { tFilter, tStatus } from "../../utils/variables";
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
  { name: tFilter.APPROVED, active: false, status: tStatus.APPROVED },
  { name: tFilter.PENDING, active: false, status: tStatus.PENDING },
  { name: tFilter.DENIED, active: false, status: tStatus.DENIED },
  { name: tFilter.EXPIRED, active: false, status: tStatus.EXPIRED },
  { name: tFilter.FUNDED, active: false, status: tStatus.FUNDED },
  {
    name: tFilter.PENDING_DISBURSEMENT,
    active: false,
    status: tStatus.PENDING_DISBURSEMENT,
  },
];

const Opportunities = () => {
  return (
    <Layout route={routes.OPPORTUNITIES}>
      <Container>
        <Heading style={{ marginBottom: "12px" }}>Loan Applications</Heading>
        <Card>
          <Table
            rows={Rows}
            thead={Thead}
            api={getLoans}
            filtersInit={filtersInit}
            initStatus={tStatus.ALL}
          />
        </Card>
      </Container>
    </Layout>
  );
};

export default Opportunities;
