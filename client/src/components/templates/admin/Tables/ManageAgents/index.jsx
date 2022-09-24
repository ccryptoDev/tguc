import React from "react";
import { TableProvider } from "../../../../../contexts/Table/table";
import Table from "../../../../organisms/Table/Add-item-agents";
import { getAgents } from "../../../../../api/admin-dashboard";
import Rows from "./Table/Rows";
import Thead from "./Table/Thead";
import Form from "../../Forms/addUpdateUser/AddUser";
import { useUserData } from "../../../../../contexts/admin";
import { getAdminRoles } from "../../../../../helpers";

const TableControls = () => {
  const { user } = useUserData();
  const role = user.user.data?.role?.roleName;

  return (
    <TableProvider>
      <Table
        userRole={role} // role of an admin that adds a new user
        rows={Rows}
        thead={Thead}
        api={getAgents}
        form={Form} // ADD AGENT FORM
        role={getAdminRoles().MerchantStaff}
        modalTitle="Add Agent"
      />
    </TableProvider>
  );
};

export default TableControls;
