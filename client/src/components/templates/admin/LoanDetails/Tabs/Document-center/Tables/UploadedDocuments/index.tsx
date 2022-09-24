import React from "react";
import Rows from "./Rows";
import Thead from "./Thead";
import { AdminTableWrapper } from "../../../../../../../atoms/Table/Table-paginated";

const DocumentsTable = ({ fetchDocs, docs, agreements }: any) => {
  return (
    <AdminTableWrapper>
      <table>
        <thead>
          <Thead />
        </thead>
        <tbody>
          <Rows items={docs} cb={fetchDocs} agreements={agreements} />
        </tbody>
      </table>
    </AdminTableWrapper>
  );
};

export default DocumentsTable;
