import React from "react";
import styled from "styled-components";
import { Text, H4, Caption as Note } from "../../../components/atoms/Typography";

const Wrapper = styled.div`
  padding: 24px;
  border: 1px solid var(--color-gray-2);
`;

const renderBankInfo = () => [
  {
    label: "Name of bank:",
    value: "American Express",
  },
  {
    label: "Account type:",
    value: "checking",
  },
  {
    label: "Routing number:",
    value: "929006130",
  },
  {
    label: "Account number:",
    value: "35655411719419",
  },
  {
    label: "Or debit card number:",
    value: "$4,000.00",
  },
];

const FormField = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid var(--color-gray-2);
  display: flex;
  justify-content: space-between;
  & .label p {
    font-weight: 700;
  }
`;

const FormFooter = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-column-gap: 10px;
  padding-top: 16px;
  & > div {
    font-size: 12px;
    font-weight: 700;

    &:not(:first-child) {
      padding-left: 12px;
      border-left: 1px solid var(--color-gray-2);
    }
  }
`;

const BankAccount = () => {
  return (
    <Wrapper>
      <H4 className="mb-12">My designated bank account</H4>
      {renderBankInfo().map((item) => {
        return (
          <FormField key={item.label}>
            <div className="label">
              <Text>{item.label}</Text>
            </div>
            <div className="value">
              <Text>{item.value}</Text>
            </div>
          </FormField>
        );
      })}
      <FormFooter>
        <div>Expiration date:</div>
        <div>Zip code:</div>
        <div>Security code:</div>
      </FormFooter>
    </Wrapper>
  );
};

export default BankAccount;
