import React from "react";
import { TableProvider } from "../../../../../contexts/Table/table";
import Table from "../../../../organisms/Table/With-filters";
import { getUsers } from "../../../../../api/admin-dashboard";
import Rows from "./Table/Rows";
import Thead from "./Table/Thead";

const TableControls = () => {
  return (
    <TableProvider>
      <Table rows={Rows} thead={Thead} api={getUsers} />
    </TableProvider>
  );
};

export default TableControls;
