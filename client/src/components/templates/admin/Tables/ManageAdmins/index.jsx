import React from "react";
import Table from "../../../../organisms/Table/Add-item";
import { getAdmins } from "../../../../../api/admin-dashboard";
import Rows from "./Table/Rows";
import Thead from "./Table/Thead";
import Form from "../../Forms/addUpdateUser/AddUser";
import { getAdminRoles } from "../../../../../helpers";

const TableControls = () => {
  return (
    <Table
      rows={Rows}
      thead={Thead}
      api={getAdmins}
      form={Form}
      modalTitle="Add Admin"
      role={getAdminRoles().SuperAdmin}
    />
  );
};

export default TableControls;
