import { Link } from "react-router-dom";
import styled, { css } from "styled-components";

export const Button = styled(Link)`
  font-size: 14px;
  line-height: 1.5;
  font-weight: 700;
  color: var(--color-blue-1);
  text-decoration: none;

  &:hover {
    color: var(--color-blue-2);
  }

  &:active {
    color: var(--color-blue-3);
  }
  &:visited {
    color: var(--color-purple-1);
  }
`;

export default Button;

export const ButtonLink = styled(Link)<{
  variant: "contained" | "outlined" | "text";
}>`
  padding: 4px 26px;
  height: 44px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.5;
  text-transform: upperCase;
  transition: all 0.2s;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  text-decoration: none;

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
      background: transparent;
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
