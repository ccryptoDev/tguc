import React, { useState } from "react";
import styled from "styled-components";
import Button from "../../../../../../atoms/Buttons/Button";
import { initForm } from "./config";
import { validate as validateCardForm } from "./Card/validate";
import { validate as validateHomeAddress } from "./validateAddress";
import Container from "../../../styles";
import { mockRequest } from "../../../../../../../utils/mockRequest";
import Loader from "../../../../../../molecules/Loaders/LoaderWrapper";
import Card from "./Card";
import BillingAddress from "./BillingAddress";

const Form = styled.form`
  .fields-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;

    & .textField:nth-child(9) {
      grid-column: 1/-1;
    }
  }

  @media screen and (max-width: 500px) {
    .fields-wrapper {
      grid-template-columns: 1fr;
    }
  }
`;

const PaymentMethod = ({ moveToNextStep }: { moveToNextStep: any }) => {
  const [form, setForm] = useState(initForm());
  const [isHomeAddress, setIsHomeAddress] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e: any) => {
    e.preventDefault();
    const [isValid, validatedForm] = validateCardForm(form);
    if (isValid) {
      const [isAddressValid, updatedForm] = validateHomeAddress(form);
      if (isAddressValid) {
        setLoading(true);
        await mockRequest();

        const userToken: any = window.localStorage.getItem("userToken");
        if (!userToken) {
          return;
        }
        const user = JSON.parse(userToken);

        setLoading(false);
        moveToNextStep();
      } else {
        setForm(updatedForm);
      }
    } else {
      setForm(validatedForm);
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
    <Container>
      <Loader loading={loading}>
        <Form onSubmit={onSubmitHandler}>
          <Card form={form} onChangeHandler={onChangeHandler} />
          <BillingAddress
            form={form}
            onChangeHandler={onChangeHandler}
            setIsHomeAddress={setIsHomeAddress}
            isHomeAddress={isHomeAddress}
          />

          <Button type="submit" variant="contained">
            Confirm
          </Button>
        </Form>
      </Loader>
    </Container>
  );
};

export default PaymentMethod;
