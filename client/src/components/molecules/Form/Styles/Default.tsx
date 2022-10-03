import styled, { css } from "styled-components";

export const input = css`
  input,
  select,
  textarea {
    width: 100%;
    padding: 2rem 1.6rem;
    font-size: 1.4rem;
    outline: none;
    background-color: #fff;
    border: 1px solid var(--color-gray-2);
    color: var(--color-grey);
    line-height: 1.5;
    box-sizing: border-box;
    position: relative;
    font-weight: 400;
    z-index: 2;
    font-family: "Poppins";
    transition: all 0.2s;
    &::placeholder {
      color: var(--color-gray-1);
    }
  }
`;

export const filled = css`
  .filled {
    border-color: #be881e;
    background: #fefcf8;
  }
`;

export const InputWrapper = styled.div<{ valid?: boolean }>`
  background: transparent;
  display: flex;
  flex-direction: column;
  position: relative;
  line-height: 1.5;

  .icon {
    position: absolute;
    top: 50%;
    transform: translate(-10px, -50%);
    right: 0;
  }

  ${input}
  ${filled}

  /* select styles */
  select {
    appearance: none;
    padding-right: 40px;
  }
  .select-wrapper {
    background: #fff;
    border: transparent;
    position: relative;
  }
  .select-wrapper::before {
    content: "";
    position: absolute;
    height: 2.4rem;
    width: 2.4rem;
    right: 0;
    top: 50%;
    transform: translate(-50%, -50%);
    background: url("${process.env.PUBLIC_URL}/images/chevron.svg") no-repeat;
    pointer-events: none;
    z-index: 10;
  }

  ${(props) =>
    props.valid &&
    css`
      & input,
      & textarea {
        border-color: transparent;
        border-radius: 6px;
        box-shadow: 0 0 0 2px #06c270;

        &:focus {
          border-color: transparent;
          box-shadow: 0 0 0 2px #06c270;
        }
      }
    `}

  .valid input:focus,
  .valid textarea:focus {
    box-shadow: var(--bshadow-success);
  }

  .invalid input:focus,
  .invalid textarea:focus {
    box-shadow: var(--bshadow-error);
  }

  .input-password {
    padding-right: 3.5rem;
  }

  &.textField.error {
    .field-label {
      color: #b63a4d;
    }
    & input,
    & select,
    & textarea {
      &,
      &:hover,
      &:active,
      &:focus {
        border-color: #b63a4d;
      }
    }
  }

  .error {
    margin: 0.5rem 0 0 0.5rem;
  }
`;

export const PlaceholderLabel = styled.div`
  position: relative;
  .field-label {
    position: absolute;
    top: 50%;
    transform: translate(20px, -50%);
    left: 0;
    font-size: 1.2rem;
    line-height: 1.5;
    margin: 0;
    transition: all 0.2s;
    z-index: 3;
    background: transparent;
    pointer-events: none;
    text-transform: upperCase;
  }

  /* HIDE PLACEHOLDER IF FIELD IS EMPLY AND NOT FOCUSED */
  & input::placeholder {
    color: transparent;
  }

  /* PLACEHOLDER COLOR */
  & input:focus {
    &::placeholder {
      color: var(--color-gray-1);
    }
  }

  /* REMOVE DEFUALT OUTFILL BACKGROUND */
  /* disable chrome autofill */
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active,
  select:-webkit-autofill,
  select:-webkit-autofill:hover,
  select:-webkit-autofill:focus,
  select:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 50px #fff inset !important;
  }

  /* ON FIELD FOCUS */
  & select:focus + .field-label,
  & input:focus + .field-label,
  & select:focus + .field-label,
  &.selected .field-label,
  &.active .field-label {
    top: 0;
    background: #fff;
    padding: 2px 4px;
    z-index: 3;
    font-size: 1.2rem;
    transform: translate(12px, -50%);
  }

  /* STYLES ON POPULATED FILED */

  &.selected .field-label,
  &.active .field-label {
    color: var(--color-gray-1);
  }

  &.selected select:focus,
  &.active input:focus {
    border-color: var(--color-green-1);
  }

  &.selected select,
  &.active input {
    border-color: var(--color-gray-1);
    &:hover {
      background: transparent;
    }
  }

  & .dob-input:focus {
    &::placeholder {
      color: #ccc;
    }
  }
`;
