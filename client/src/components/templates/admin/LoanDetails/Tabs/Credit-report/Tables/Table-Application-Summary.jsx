import React from "react";
import styled from "styled-components";
import { AdminTableWrapper } from "../../../../../../atoms/Table/Table-paginated";
import { formatCurrency } from "../../../../../../../utils/formats";

const TableWrapper = styled(AdminTableWrapper)`
  table tbody tr td:first-child {
    width: 250px;
  }
`;

const ApplicationSummaryTable = ({ report, screenTracking }) => {
  const score = report?.user?.creditScore;
  const DTI = screenTracking?.DTIPercent;
  const PTIPercent = screenTracking?.PTIPercent;
  const TotalGMI = screenTracking?.TotalGMI;
  const disposableIncome = screenTracking?.disposableIncome;
  return (
    <TableWrapper>
      <table>
        <tbody>
          <tr>
            <td>
              <b>Score</b>
            </td>
            <td>{score}</td>
          </tr>
          <tr>
            <td>
              <b>DTI</b>
            </td>
            <td>{DTI}%</td>
          </tr>
          <tr>
            <td>
              <b>PTI</b>
            </td>
            <td>{PTIPercent}%</td>
          </tr>
          <tr>
            <td>
              <b>Total GMI</b>
            </td>
            <td>{formatCurrency(TotalGMI)}</td>
          </tr>
          <tr>
            <td>
              <b>Disposable Income</b>
            </td>
            <td>{formatCurrency(disposableIncome)}</td>
          </tr>
        </tbody>
      </table>
    </TableWrapper>
  );
};

export default ApplicationSummaryTable;
