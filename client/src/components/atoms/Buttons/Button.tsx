import styled, { css } from "styled-components";
import { Link } from "react-router-dom";

export const common = css`
  padding: 0 2.6rem;
  height: 4.4rem;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.5;
  font-family: Poppins;
  text-transform: upperCase;
  transition: all 0.2s;
  border: none;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
  }
`;

const Button = styled.button<{
  variant: "contained" | "outlined" | "text";
}>`
  ${common}

  ${(props) =>
    props.variant === "contained" &&
    css`
      border: none;
      color: #fff;
      background: var(--color-blue-1);
      &:hover {
        background: var(--color-blue-3);
      }

      &:active {
        background: var(--color-blue-1);
      }

      &:disabled {
        background: var(--color-gray-1);
      }
    `}

  ${(props) =>
    props.variant === "outlined" &&
    css`
      border: 1px solid var(--color-blue-1);
      background: #fff;
      color: var(--color-blue-1);
      &:hover {
        border: 1px solid var(--color-blue-2);
        color: var(--color-blue-2);
      }

      &:active {
        border: 1px solid var(--color-blue-3);
        color: var(--color-blue-3);
        background: var(--color-background-gray);
      }

      &:disabled {
        border: 1px solid var(--color-gray-1);
        color: var(--color-gray-1);
      }
    `}

    ${(props) =>
    props.variant === "text" &&
    css`
      border: none;
      background: transparent;
      color: var(--color-blue-1);
      &:hover {
        color: var(--color-blue-2);
      }

      &:active {
        color: var(--color-blue-3);
      }

      &:disabled {
        color: var(--color-gray-1);
      }
    `}
`;

export const link = css`
  padding: 1.2rem;
  display: inline-block;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  color: #fff;
  background: var(--color-blue-1);
  text-decoration: none;

  &:hover {
    transition: all 0.2s;
    background: var(--color-blue-2);
  }
`;

export const LinkButton = styled(Link)`
  ${link}
`;

export default Button;
