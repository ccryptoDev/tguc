import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  column-gap: 10px;

  .MuiButton-root {
    text-transform: revert;
  }

  & button {
    font-size: 14px;
    box-shadow: 0px 0px 1px rgb(40 41 61 / 4%), 0px 2px 4px rgb(96 97 112 / 16%);
    opacity: 0.9;
    transition: all 0.2s;
    &:hover {
      opacity: 1;
    }
  }
`;

type IButtonsWrapper = {
  children: any;
  className?: string;
};

const ButtonsWrapper = ({ children, className }: IButtonsWrapper) => {
  return <Wrapper className={className}>{children}</Wrapper>;
};

export default ButtonsWrapper;
