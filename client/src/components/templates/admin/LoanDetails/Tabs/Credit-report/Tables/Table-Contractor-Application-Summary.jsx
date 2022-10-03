import React from "react";
import styled from "styled-components";
import { AdminTableWrapper } from "../../../../../../atoms/Table/Table-paginated";
import { formatCurrency } from "../../../../../../../utils/formats";

const TableWrapper = styled(AdminTableWrapper)`
  table tbody tr td:first-child {
    width: 250px;
  }
`;

const ApplicationSummaryTable = ({ report, practice }) => {
  const score = report?.user?.creditScore;
  const yearsInBusiness = practice?.yearsInBusiness;
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
              <b>Years in Business</b>
            </td>
            <td>{yearsInBusiness || "--"}</td>
          </tr>
        </tbody>
      </table>
    </TableWrapper>
  );
};

export default ApplicationSummaryTable;
