import React from "react";
import styled from "styled-components";
import CheckBox from "../../../../../../../molecules/Form/Fields/Checkbox/Custom";
import { renderBillingAddress } from "../config";
import { H4 } from "../../../../../../../atoms/Typography";

const SectionWrapper = styled.div`
  margin: 24px 0;

  .heading-wrapper {
    margin: 14px 0;
    display: flex;
    column-gap: 10px;
  }
`;

interface IBillingAddress {
  isHomeAddress: boolean;
  setIsHomeAddress: any;
  form: any;
  onChangeHandler: any;
}

const BillingAddress = ({
  isHomeAddress,
  setIsHomeAddress,
  form,
  onChangeHandler,
}: IBillingAddress) => {
  return (
    <SectionWrapper>
      <div className="heading-wrapper">
        <H4>Billing Address</H4>
      </div>
      <div className="heading-wrapper">
        <CheckBox
          label="Home Address"
          value={isHomeAddress}
          onChange={() => setIsHomeAddress(!isHomeAddress)}
        />
      </div>
      <div className="fields-wrapper">
        {renderBillingAddress(form).map(
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
    </SectionWrapper>
  );
};

export default BillingAddress;
