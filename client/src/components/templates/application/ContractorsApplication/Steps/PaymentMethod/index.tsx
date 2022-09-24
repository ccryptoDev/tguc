import React, { useState } from "react";
import styled from "styled-components";
import Container from "../../styles";
import { renderACHPayment, initAchForm } from "./config";
import { validateForm } from "./validate";
import { H3, H4 } from "../../../../../atoms/Typography";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";
import { mockRequest } from "../../../../../../utils/mockRequest";
import Button from "../../../../../atoms/Buttons/Button";
import AccountType from "./AccountType";
import { accountTypes } from "./AccountType/config";

const Form = styled.form`
  .fields-wrapper {
    display: grid;
    grid-template-columns: 320px 320px;
    grid-gap: 12px;
    margin: 14px 0;

    & .textField:nth-child(9) {
      grid-column: 1/-1;
    }
  }

  @media screen and (max-width: 500px) {
    .textField:first-child {
      margin-top: 12px;
    }
  }
`;

const FormComponent = ({ moveToNextStep }: { moveToNextStep: any }) => {
  const [form, setForm] = useState(initAchForm());
  const [accountType, setAccountType] = useState(accountTypes.CHECKING);
  const [loading, setLoading] = useState(false);

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevState: any) => ({
      ...prevState,
      [name]: { ...prevState[name], value, message: "" },
    }));
  };

  const onSubmitHandler = async (e: any) => {
    e.preventDefault();
    const [isValid, validatedForm] = validateForm(form);
    if (isValid) {
      setLoading(true);
      await mockRequest();
      setLoading(false);
      moveToNextStep();
    } else {
      setForm(validatedForm);
    }
  };
  return (
    <Container>
      <Loader loading={loading}>
        <Form onSubmit={onSubmitHandler}>
          <H3>Bank Account</H3>
          <H4>How we pay you.</H4>
          <div className="fields-wrapper">
            {renderACHPayment(form).map(
              ({ component: Component, ...field }) => {
                return (
                  <Component
                    key={field.name}
                    {...field}
                    onChange={onChangeHandler}
                  />
                );
              }
            )}
          </div>
          <AccountType
            accountType={accountType}
            onClick={(type: string) => setAccountType(type)}
          />
          <Button type="submit" variant="contained">
            Confirm
          </Button>
        </Form>
      </Loader>
    </Container>
  );
};

export default FormComponent;
