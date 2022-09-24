import React, { useState } from "react";
import { toast } from "react-toastify";
import Rows from "./Row";
import Thead from "./Thead";
import { AdminTableWrapper } from "../../../../../../atoms/Table/Table-paginated";
import StyledTable from "../../../../../../atoms/Table/Details-horizontal";
import { validate } from "../validate";
import { setZipCodeToMerchant } from "../../../../../../../api/admin-dashboard";
import { parseTableToFormat, validateRepeatingZipCode } from "../parsers";
import { initForm } from "../config";

const Table = ({ setTableItems, tableItems, userId, fetchTableData }: any) => {
  const [form, setForm] = useState(initForm());
  const [updatingItem, setUpdatingItem] = useState({ loading: false, id: "" });

  const onChangeTextInput = (e: any) => {
    const { name, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      [name]: { value },
    }));
  };

  const onEditHandler = (id: string) => {
    // FIND TABLE ROW BY ID AND SET EDIT PROPERTY TO TRUE
    const { radius, zipCode } = tableItems.find((item: any) => item.id === id);
    const updatedTableItems = tableItems.map((item: any) => {
      if (item.id === id) {
        return {
          ...item,
          edit: true,
        };
      }
      return {
        ...item,
        edit: false,
      };
    });
    // ADD TABLE ROW DATA TO THE FORM
    setForm((prevState) => ({
      ...prevState,
      zipCode: { ...prevState.zipCode, value: zipCode, message: "" },
      radius: { ...prevState.radius, value: radius, message: "" },
    }));
    setTableItems(updatedTableItems);
  };

  const onCancelHandler = (id: string) => {
    // FIND TABLE ROW BY ID AND SET EDIT PROPERTY TO FALSE
    const updatedTableItems = tableItems.map((item: any) => {
      if (item.id === id) {
        return {
          ...item,
          edit: false,
        };
      }
      return item;
    });
    setTableItems(updatedTableItems);
  };

  const onRemoveItemHandler = async (id: string) => {
    const updatedTable = tableItems.filter((row: any) => row.id !== id);
    const parsedTable = parseTableToFormat(updatedTable);
    setUpdatingItem({ loading: true, id });
    const result = await setZipCodeToMerchant({ table: parsedTable, userId });
    if (result && !result.error) {
      await fetchTableData();
    }
    setUpdatingItem({ loading: false, id: "" });
  };

  const onUpdateTableHandler = async (id: string) => {
    // VALIDATE THE FORM BEFORE MERGING TO THE TABLE
    const [isValid, updatedForm] = validate(form);
    if (!isValid) {
      setForm(updatedForm);
      return;
    }
    const isRepeating = validateRepeatingZipCode(form, tableItems, id);
    if (!isRepeating) {
      // MERGE THE DATA TO THE TABLE
      const updatedTableItem = {
        zipcode: form.zipCode.value,
        radius: form.radius.value,
      };
      const index = tableItems.findIndex((item: any) => {
        return item.id === id;
      });
      const parsedTable = parseTableToFormat(tableItems);
      parsedTable[index] = updatedTableItem;

      // UPDATE THE TABLE ON THE DB
      setUpdatingItem({ loading: true, id });
      const result = await setZipCodeToMerchant({ table: parsedTable, userId });
      if (result && !result.error) {
        await fetchTableData();
      }
      setUpdatingItem({ loading: false, id: "" });
    } else {
      setForm((prevState: any) => ({
        ...prevState,
        zipCode: { ...prevState.zipCode, message: "zip code exists" },
      }));
    }
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
            onUpdateTableHandler={onUpdateTableHandler}
            onEditHandler={onEditHandler}
            onChange={onChangeTextInput}
            onCancelHandler={onCancelHandler}
            rows={tableItems}
            form={form}
            updatingItem={updatingItem}
          />
        </tbody>
      </StyledTable>
    </AdminTableWrapper>
  );
};

export default Table;
