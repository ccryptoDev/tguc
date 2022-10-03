import React from "react";
import styled from "styled-components";
import { AdminTableWrapper } from "../../../../../../atoms/Table/Table-paginated";

const TableWrapper = styled(AdminTableWrapper)`
  table tbody tr td:first-child {
    width: 250px;
  }
`;

const ApplicationSummaryTable = ({ message, passed, userValue }) => {
  return (
    <TableWrapper>
      <table>
        <tbody>
          <tr>
            <td>
              <b>Message</b>
            </td>
            <td>{message}</td>
          </tr>
          <tr>
            <td>
              <b>Passed</b>
            </td>
            <td>
              <div className={passed ? "success" : "danger"}>
                {passed ? "yes" : "no"}
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <b>User Value</b>
            </td>
            <td>{userValue}</td>
          </tr>
        </tbody>
      </table>
    </TableWrapper>
  );
};

export default ApplicationSummaryTable;
