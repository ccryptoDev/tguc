import React from "react";
import Layout from "../../layouts/admin";
import { routes } from "../../routes/Admin/routes.config";
import Table from "../../components/organisms/Table/With-filters";
import { tFilter, tStatus } from "../../utils/variables";
import Container from "../../layouts/admin/container";
import { H3 as Heading } from "../../components/atoms/Typography";
import Card from "../../components/atoms/Cards/Large";
import { getContractors } from "../../api/admin-dashboard";
import Rows from "../../components/templates/admin/Tables/ContractorApplications/Rows";
import Thead from "../../components/templates/admin/Tables/ContractorApplications/Thead";

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
  { name: tFilter.QUALIFIED, active: false, status: tStatus.QUALIFIED },
  { name: tFilter.NON_QUALIFIED, active: false, status: tStatus.NON_QUALIFIED },
  { name: tFilter.DENIED, active: false, status: tStatus.DENIED },
  { name: tFilter.EXPIRED, active: false, status: tStatus.EXPIRED },
  { name: tFilter.FUNDED, active: false, status: tStatus.FUNDED },
  {
    name: tFilter.PENDING_DISBURSEMENT,
    active: false,
    status: tStatus.PENDING_DISBURSEMENT,
  },
];

const ContractorOpportunities = () => {
  return (
    <Layout route={routes.CONTRACTOR_OPPORTUNITIES}>
      <Container>
        <Heading style={{ marginBottom: "12px" }}>
          Contractor Applications
        </Heading>
        <Card>
          <Table
            rows={Rows}
            thead={Thead}
            filtersInit={filtersInit}
            initStatus={tStatus.ALL}
            api={getContractors}
          />
        </Card>
      </Container>
    </Layout>
  );
};

export default ContractorOpportunities;
