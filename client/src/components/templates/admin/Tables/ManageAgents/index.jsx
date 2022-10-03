import React from "react";
import { TableProvider } from "../../../../../contexts/Table/table";
import Table from "../../../../organisms/Table/Add-item";
import { getAgents } from "../../../../../api/admin-dashboard";
import Rows from "./Table/Rows";
import Thead from "./Table/Thead";
import Form from "../../Forms/addUpdateUser/AddUser";
import { useUserData } from "../../../../../contexts/admin";
import { getAdminRoles } from "../../../../../helpers";

const TableControls = () => {
  const { user } = useUserData();
  const userRole = user.user.data?.role?.roleName;
  const { Merchant, MerchantStaff } = getAdminRoles();
  const isMerchant = userRole === Merchant;

  return (
    <TableProvider>
      <Table
        userRole={userRole} // role of an admin that adds a new user
        rows={Rows}
        thead={Thead}
        api={getAgents}
        form={Form} // ADD AGENT FORM
        role={MerchantStaff}
        modalTitle="Add Agent"
        isButtonShown={isMerchant}
      />
    </TableProvider>
  );
};

export default TableControls;
