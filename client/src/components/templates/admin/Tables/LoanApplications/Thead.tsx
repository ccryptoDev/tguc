import React from "react";
import { getAdminRoles } from "../../../../../helpers";

const Thead = ({ role }: any) => {
  const adminRoles = getAdminRoles();
  return (
    <tr>
      <th>Application</th>
      <th>Name</th>
      <th>Status</th>
      <th>Requested Amount</th>
      <th>Date Created</th>
      <th>Phone Number</th>
      <th>Email Address</th>
      <th>Contractor</th>
      <th>Contractor Business</th>
      {role && role !== adminRoles.MerchantStaff ? <th> Action</th> : <></>}
    </tr>
  );
};

export default Thead;
