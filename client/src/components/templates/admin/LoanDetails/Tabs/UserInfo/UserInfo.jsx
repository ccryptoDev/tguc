import React from "react";
import NativeSelect from "@material-ui/core/Select";
import styled from "styled-components";
import Table from "../../../../../molecules/Table/Details-vertical";
import Heading from "../../../../../molecules/Typography/admin/DetailsHeading";
import renderRows from "./config";
import { AdminTableWrapper } from "../../../../../atoms/Table/Table-paginated";

const Styles = styled(AdminTableWrapper)`
  table {
    & tr th {
      width: 300px;
    }
  }
  .MuiInput-input {
    font-size: 16px;
  }
`;

const UserInfo = ({ state }) => {
  const contractorReference = state?.referredBy?.userReference;
  const isContractor = state?.screenTracking?.isContractor;
  return (
    <Styles>
      <Heading text="User Information" />
      <Table
        rows={renderRows({
          ...state?.screenTracking,
          ...state?.paymentManagement,
          ...state?.practiceManagement,
          ...state?.screenTracking.user,
          contractorReference,
          financingStatus: isContractor
            ? "Contrator Application Status"
            : "Financing Status",
        })}
      />
    </Styles>
  );
};

export default UserInfo;
