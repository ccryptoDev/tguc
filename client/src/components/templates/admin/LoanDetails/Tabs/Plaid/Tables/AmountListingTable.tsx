import React from "react";
import { Amount } from "../Types/Amount";

type IProps = {
  items: Amount[];
};

const AmountListingTable = ({ items }: IProps) => {
  return (
    <table>
      <thead>
        <tr>
          <th className="half">Description</th>
          <th>Amount</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item: Amount) => (
          <tr key={item.id}>
            <td>{item.description}</td>
            <td>{`${item.currency} ${item.amount}`}</td>
            <td>{item.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AmountListingTable;
