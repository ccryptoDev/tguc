import React from "react";
import styled from "styled-components";
import { AdminTableWrapper } from "../../../../../../atoms/Table/Table-paginated";
import { formatCurrency } from "../../../../../../../utils/formats";

const TableWrapper = styled(AdminTableWrapper)`
  table tbody tr td:first-child {
    width: 250px;
  }
`;

const ApplicationSummaryTable = () => {
  return (
    <TableWrapper>
      <table>
        <tbody>
          <tr>
            <td>
              <b>Score</b>
            </td>
            <td>824</td>
          </tr>
          <tr>
            <td>
              <b>DTI</b>
            </td>
            <td>15.5%</td>
          </tr>
          <tr>
            <td>
              <b>PTI</b>
            </td>
            <td>4.74%</td>
          </tr>
          <tr>
            <td>
              <b>Total GMI</b>
            </td>
            <td>{formatCurrency(7500)}</td>
          </tr>
          <tr>
            <td>
              <b>Disposable Income</b>
            </td>
            <td>{formatCurrency(5615.14)}</td>
          </tr>
        </tbody>
      </table>
    </TableWrapper>
  );
};

export default ApplicationSummaryTable;
