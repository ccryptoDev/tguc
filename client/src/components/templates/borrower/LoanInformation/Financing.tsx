import React from "react";
import Table from "../../../atoms/Table/Details-vertical";
import Card from "../Components/Table-Card";

const Financing = ({ reference, name, status }: any) => {
  return (
    <Card className="mt-20">
      <Table>
        <tbody>
          <tr>
            <td>Financing reference</td>
            <td>{reference || "--"}</td>
          </tr>
          <tr>
            <td>Name</td>
            <td>{name || "--"}</td>
          </tr>
          <tr>
            <td>Status</td>
            <td>{status || "--"}</td>
          </tr>
        </tbody>
      </Table>
    </Card>
  );
};

export default Financing;
