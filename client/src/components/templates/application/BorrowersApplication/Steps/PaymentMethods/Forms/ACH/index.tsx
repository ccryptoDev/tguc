import React from "react";
import styled from "styled-components";
import { renderACHPayment } from "./config";
import { H4 } from "../../../../../../../atoms/Typography";
import AccountType from "./AccountType";

const Wrapper = styled.div`
  margin: 24px 0;

  .heading-wrapper {
    margin: 14px 0;
    display: flex;
    column-gap: 10px;
  }
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

const FormComponent = ({
  form,
  onChangeHandler,
  setAccountType,
}: {
  form: any;
  onChangeHandler: any;
  setAccountType: any;
}) => {
  return (
    <Wrapper>
      <div className="heading-wrapper">
        <H4>ACH Details</H4>
      </div>
      <div className="fields-wrapper">
        {renderACHPayment(form).map(({ component: Component, ...field }) => {
          return (
            <Component key={field.name} {...field} onChange={onChangeHandler} />
          );
        })}
      </div>
      <AccountType
        accountType={form.accountType.value}
        onClick={(type: string) =>
          setAccountType({ name: "accountType", value: type })
        }
      />
    </Wrapper>
  );
};

export default FormComponent;
