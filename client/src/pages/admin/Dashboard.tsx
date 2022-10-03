import React, { useEffect } from "react";
import Layout from "../../layouts/admin";
import { routes } from "../../routes/Admin/routes.config";
import Table from "../../components/organisms/Table/Paginated";
import { getLoans } from "../../api/admin-dashboard";
import Statuses from "../../components/organisms/StatusCards/StatusCards";
import { tStatus } from "../../utils/variables";
import { AdminTableWrapper } from "../../components/atoms/Table/Table-paginated";
import Container from "../../layouts/admin/container";
import { useUserData } from "../../contexts/admin";
import {
  H3 as Heading,
  H4 as Heading3,
} from "../../components/atoms/Typography";
import { usePaginatedTable } from "../../hooks/paginatedTable";
import Rows from "../../components/templates/admin/Tables/LoanApplications/Rows";
import Thead from "../../components/templates/admin/Tables/LoanApplications/Thead";

const Dashboard = () => {
  const { user } = useUserData();
  const role = user?.user?.data?.roleName;
  const userName = user?.user?.data.userName;
  const userNameCapitalized =
    userName?.charAt(0).toUpperCase() + userName?.slice(1);
  const { tableData, fetchTable, pagination } = usePaginatedTable({
    api: getLoans,
    payload: { page: 1, perPage: 25, status: tStatus.ALL },
  });

  useEffect(() => {
    fetchTable();
  }, []);

  return (
    <Layout route={routes.DASHBOARD}>
      <Container>
        <Heading style={{ marginBottom: "12px" }}>Dashboard</Heading>
        <Heading3>Welcome {userNameCapitalized || ""}</Heading3>
        <br />
        <br />
        <Statuses />
        <AdminTableWrapper>
          <Table
            rows={<Rows items={tableData?.items} role={role} cb={fetchTable} />}
            thead={<Thead role={role} />}
            pagination={pagination}
          />
        </AdminTableWrapper>
      </Container>
    </Layout>
  );
};

export default Dashboard;
