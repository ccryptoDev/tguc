import React from "react";
import { v4 as uuid } from "uuid";
import NativeSelect from "@material-ui/core/Select";
import styled from "styled-components";
import Table from "../../../../../molecules/Table/Details-vertical";
import Heading from "../../../../../molecules/Typography/admin/DetailsHeading";
import renderRows from "./config";
import { AdminTableWrapper } from "../../../../../atoms/Table/Table-paginated";
import { useUserData } from "../../../../../../contexts/admin";
import { getAdminRoles } from "../../../../../../helpers";

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

const ReasonsCard = styled.div`
  padding: 8px;
  box-shadow: 0 0.5px 1.75px rgba(0, 0, 0, 0.039),
    0 1.85px 6.25px rgba(0, 0, 0, 0.19);
  border-radius: 6px;
  background: #fff;
  overflow: hidden;
  h2 {
    font-weight: 600;
    font-size: 18px;
    margin-top: 16px;
    margin-bottom: 8px;
  }
  p {
    border-bottom: 1px solid #efefef;
    padding: 6px 2px;
    &:last-child {
      border-bottom: none;
    }
  }
`;

const UserInfo = ({ state }) => {
  const contractorReference = state?.referredBy?.userReference;
  const isContractor = state?.screenTracking?.isContractor;
  const declineReasons = state?.screenTracking?.declineReasons;
  const { user } = useUserData();
  const adminRoles = getAdminRoles();
  const role = user?.user?.data?.role?.roleName;
  const isAdmin = role === adminRoles.SuperAdmin;

  return (
    <Styles>
      <Heading text="User Information" />
      <Table
        rows={renderRows({
          ...state?.screenTracking,
          ...state?.paymentManagement,
          ...state?.user,
          businessAddress: state?.practiceManagement,
          contractorReference,
          isAdmin,
          financingStatus: isContractor
            ? "Contractor Application Status"
            : "Financing Status",
        })}
      />
      {state?.screenTracking &&
        role &&
        role === adminRoles.SuperAdmin &&
        declineReasons?.length > 0 && (
          <div style={{ marginTop: "8px" }}>
            <ReasonsCard>
              <h2>Denied reasons</h2>
              {declineReasons[0]?.reasons &&
                declineReasons[0].reasons.map((reason) => (
                  <p key={uuid()}>{reason}</p>
                ))}
            </ReasonsCard>
          </div>
        )}
    </Styles>
  );
};

export default UserInfo;
