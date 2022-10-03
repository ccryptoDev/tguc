import React from "react";
import styled from "styled-components";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "../../atoms/Buttons/Button";

const Btn = styled(Button)`
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;

  &:disabled {
    cursor: not-allowed;
    &.contained {
      background: var(--color-blue-1);
      color: #fff;
    }
  }

  &.loading {
    cursor: wait;
  }

  .MuiCircularProgress-root svg {
    height: 100%;
  }
`;

const SubmitButton = ({
  children,
  onClick,
  className,
  loading,
  type = "button",
  disabled = false,
  variant,
}: {
  onClick?: any;
  className?: string;
  loading?: boolean;
  children: any;
  type?: "button" | "submit";
  disabled?: boolean;
  variant: "text" | "contained" | "outlined";
}) => {
  return (
    <Btn
      className={`${className} ${loading ? "loading" : ""}`}
      onClick={onClick}
      variant={variant}
      type={type}
      disabled={disabled || loading}
    >
      {loading ? <CircularProgress size={20} color="inherit" /> : children}
    </Btn>
  );
};

export default SubmitButton;
