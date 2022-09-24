import React from "react";
import Table from "../../../atoms/Table/Details-vertical";
import { formatCurrency, formatDate } from "../../../../utils/formats";
import Card from "../Components/Table-Card";

const FinancingDetails = ({
  amountFinanced,
  apr,
  financingTerm,
  maturityDate,
}: any) => {
  return (
    <Card className="mt-20">
      <Table>
        <tbody>
          <tr>
            <td>Amount financed</td>
            <td>{formatCurrency(amountFinanced)}</td>
          </tr>
          <tr>
            <td>APR</td>
            <td>{apr ? `${apr}` : "--"}</td>
          </tr>
          <tr>
            <td>Financing term</td>
            <td>{financingTerm ? `${financingTerm} months` : "--"}</td>
          </tr>
          <tr>
            <td>Maturity date</td>
            <td>{formatDate(maturityDate)}</td>
          </tr>
        </tbody>
      </Table>
    </Card>
  );
};

export default FinancingDetails;
