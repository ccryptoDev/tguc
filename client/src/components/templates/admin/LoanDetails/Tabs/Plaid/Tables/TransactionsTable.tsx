import React from "react";
import { Transaction } from "../Types/Transaction";

type IProps = {
  transactions: Transaction[];
};

const TransactionsTable = ({ transactions }: IProps) => {
  return (
    <table>
      <thead>
        <tr>
          <th className="no-wrap">Merchant Name</th>
          <th>Name</th>
          <th className="no-wrap">Payment Channel</th>
          <th>Category</th>
          <th className="no-wrap">Transaction Type</th>
          <th>Amount</th>
          <th>Date</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((transaction: Transaction) => (
          <tr key={transaction.transaction_id}>
            <td>{transaction.merchant_name}</td>
            <td>{transaction.name}</td>
            <td>{transaction.payment_channel}</td>
            <td className="wrap-normal">{transaction.category.join(", ")}</td>
            <td>{transaction.transaction_type}</td>
            <td>{`${transaction.iso_currency_code} ${transaction.amount}`}</td>
            <td className="no-wrap">{transaction.date}</td>
            <td>{transaction.pending ? "Pending" : "Completed"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
export default TransactionsTable;
