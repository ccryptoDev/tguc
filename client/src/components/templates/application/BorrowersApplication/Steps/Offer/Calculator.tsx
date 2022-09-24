import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Input from "../../../../../molecules/Form/Fields/FormattedField/Placeholder-label";
import { Text } from "../../../../../atoms/Typography";
import Button from "../../../../../atoms/Buttons/Button";
import { validateFinancedAmount } from "./validator";
import { initForm } from "./config";

const Wrapper = styled.div`
  & > p {
    margin: 24px 0;
  }
  & > form {
    display: flex;
    align-items: center;
    gap: 12px;

    & button {
      height: auto;
    }

    & .textField {
      max-width: 320px;
      width: 100%;
    }

    @media screen and (max-width: 400px) {
      flex-direction: column;
    }
  }
`;

const Calculator = ({
  financedAmount = "",
  cb,
}: {
  financedAmount: string | number;
  cb: any;
}) => {
  const [form, setForm] = useState(initForm());

  useEffect(() => {
    setForm((prevState: any) => ({
      ...prevState,
      amount: { ...prevState.amount, value: financedAmount },
    }));
  }, [financedAmount]);

  const onSubmitHandler = (e: any) => {
    e.preventDefault();
    const message = validateFinancedAmount(form.amount.value, financedAmount);
    if (message) {
      setForm((prevState: any) => ({
        ...prevState,
        amount: { ...prevState.amount, message },
      }));
    } else {
      cb(form.amount.value);
    }
  };

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevState: any) => ({
      ...prevState,
      [name]: { ...prevState[name], value, message: "" },
    }));
  };

  return (
    <Wrapper>
      <Text>
        Please enter the amount you would like to finance below. Then select a
        monthly payment option to continue.
      </Text>
      <form onSubmit={onSubmitHandler}>
        <Input
          value={form.amount.value}
          onChange={onChangeHandler}
          placeholder="Enter amount"
          message={form.amount.message}
          label="Finance"
          name="amount"
          prefix="$"
          thousandSeparator
        />
        <Button type="submit" variant="text">
          Calculate Payments
        </Button>
      </form>
    </Wrapper>
  );
};

export default Calculator;
