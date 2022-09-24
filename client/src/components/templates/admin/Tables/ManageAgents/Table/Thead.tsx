import React from "react";
import { getAdminData, getAdminRoles } from "../../../../../../helpers";

const Thead = () => {
  const adminData = getAdminData();
  const adminRoles = getAdminRoles();
  return (
    <tr>
      <th>Agent Name</th>
      <th>Email Address</th>
      <th>Phone Number</th>
      {adminData && adminData.role === adminRoles.SuperAdmin && (
        <th>Contractor</th>
      )}
      <th>Agent Reference</th>
      <th>Date Created</th>
      <th>Action</th>
    </tr>
  );
};

export default Thead;
