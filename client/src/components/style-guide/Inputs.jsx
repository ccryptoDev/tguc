import React, { useState } from "react";
import styled from "styled-components";
import Field from "../molecules/Form/Fields/FormattedField/Placeholder-label";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 10px;
`;

const formInit = () => {
  return {
    amount: { value: "", message: "" },
    phone: { value: "", message: "" },
  };
};

const renderInputs = (form) => [
  {
    value: form.amount.value,
    name: "amount",
    component: Field,
    placeholder: "enter amount",
    message: form.amount.message,
    label: "amount financed",
    prefix: "$",
    thousandSeparator: true,
  },
  {
    value: form.phone.value,
    name: "phone",
    component: Field,
    placeholder: "enter phone number",
    message: form.phone.value,
    label: "phone",
    mask: "_",
    format: "+1 (###) ### ####",
  },
];

const Inputs = () => {
  const [form, setForm] = useState(formInit());
  const onChangeHandler = (e) => {
    setForm((prevState) => ({
      ...prevState,
      [e.target.name]: { value: e.target.value, message: "" },
    }));
  };

  return (
    <Wrapper>
      {renderInputs(form).map(({ component: Component, ...item }) => {
        return (
          <Component
            key={item.name}
            component={Component}
            onChange={onChangeHandler}
            {...item}
          />
        );
      })}
    </Wrapper>
  );
};

export default Inputs;
