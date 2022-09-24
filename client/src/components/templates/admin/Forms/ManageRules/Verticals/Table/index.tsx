import React, { useState } from "react";
import Rows from "./Row";
import Thead from "./Thead";
import { AdminTableWrapper } from "../../../../../../atoms/Table/Table-paginated";
import StyledTable from "../../../../../../atoms/Table/Details-horizontal";
import { getRequester } from "../../../../../../../api/admin-dashboard/requester";
import baseUrl from "../../../../../../../app.config";

const Table = ({ tableItems, onUpdateOptionsHandler, userId }: any) => {
  const [updatingItem, setUpdatingItem] = useState({ loading: false, id: "" });

  const onRemoveItemHandler = async (id: string) => {
    setUpdatingItem({
      loading: true,
      id,
    });
    // UPDATE TABLE ITEMS
    getRequester()
      .delete(`${baseUrl}/api/admin/dashboard/verticals/${id}`)
      .then((res) => {
        const updatedTable = tableItems.filter((row: any) => row.id !== id);
        // SET UPDATED TABLE ITEMS AND SELECT OPTIONS
        onUpdateOptionsHandler(updatedTable);
        setUpdatingItem({
          loading: false,
          id: "",
        });
      })
      .catch((err) => {
        setUpdatingItem({
          loading: false,
          id: "",
        });
        console.log(err);
      });
  };

  return (
    <AdminTableWrapper>
      <StyledTable>
        <thead>
          <Thead />
        </thead>
        <tbody>
          <Rows
            onRemoveItemHandler={onRemoveItemHandler}
            rows={tableItems}
            updatingItem={updatingItem}
          />
        </tbody>
      </StyledTable>
    </AdminTableWrapper>
  );
};

export default Table;
