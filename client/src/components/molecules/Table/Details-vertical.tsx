import React from "react";
import Table from "../../atoms/Table/Details-vertical";
import { dateCheck } from "../../../utils/formats";

type IDetailsTableProps = {
  rows: { value: any; label: string; component?: any }[];
  onChange?: Function;
  edit?: boolean;
};

const DetailsVerticalTable = ({
  rows = [],
  onChange,
  edit,
}: IDetailsTableProps) => {
  return (
    <Table>
      <tbody>
        {rows.length > 0
          ? rows.map(({ label, value, component: Component, ...props }) => {
              return (
                <tr key={label}>
                  <th>
                    <div className="label">{label}</div>
                  </th>
                  <td>
                    {edit && Component ? (
                      <Component {...props} value={value} onChange={onChange} />
                    ) : (
                      <div className="value">{dateCheck(value)}</div>
                    )}
                  </td>
                </tr>
              );
            })
          : ""}
      </tbody>
    </Table>
  );
};

export default DetailsVerticalTable;
