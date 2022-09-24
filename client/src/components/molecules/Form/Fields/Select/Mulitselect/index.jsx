import React from "react";
import styled from "styled-components";
import { MultiSelect } from "react-multi-select-component";
import Error from "../../../Elements/FieldError";

const Wrapper = styled.div`
  & .multi-select .dropdown-container {
    width: 100%;
    padding: 9px;
    font-size: 1.4rem;
    outline: none;
    background-color: #fff;
    border: 1px solid var(--color-gray-2);
    color: var(--color-grey);
    border-radius: 0;
    box-sizing: border-box;
    position: relative;
    font-weight: 400;
    z-index: 2;
    font-family: "Poppins";
    transition: all 0.2s;
    outline: none;
    &::placeholder {
      color: var(--color-gray-1);
    }
    &:focus-within {
      border-color: var(--color-green-1);
      background: #fff;
      box-shadow: none;
    }
  }

  &.isError {
    & .multi-select .dropdown-container {
      border-color: #b63a4d;
    }

    & .error {
      font-size: 14px;
      margin: 5px 0 0 5px;
    }
  }

  &.filled {
    & .multi-select .dropdown-container {
      border-color: var(--color-gray-1);
    }
  }
`;

const Select = ({ value = "", message = "", ...props }) => {
  return (
    <Wrapper
      className={`${value?.length ? "filled" : ""} ${message ? "isError" : ""}`}
    >
      <MultiSelect {...props} value={value} />
      {message ? <Error message={message} /> : ""}
    </Wrapper>
  );
};

export default Select;
