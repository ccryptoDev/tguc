import React from "react";
import CurrencyFormat from "react-number-format";
import Error from "../../Elements/FieldError";
import { InputWrapper, PlaceholderLabel } from "../../Styles/Default";
import Label from "../../Elements/FieldLabel";
import { SuccessIcon } from "../../../../atoms/Icons/SvgIcons/Status-outlined";

type IFormattedField = {
  format?: any;
  mask?: any;
  label?: string;
  valid?: boolean;
  disabled?: boolean;
  message?: string;
  onChange: any;
  name: string;
  placeholder?: string;
  value: string | number;
  isAllowed?: any;
  displayType?: "input" | "text";
  autoFocus?: boolean;
  prefix?: string;
  thousandSeparator?: boolean;
};

const FormattedField = ({
  isAllowed,
  mask,
  autoFocus = false,
  format,
  value = "",
  displayType,
  label = "",
  valid,
  disabled = false,
  message = "",
  onChange,
  name = "field",
  placeholder = "",
  ...props
}: IFormattedField) => {
  const isValid = !!(valid && !message);
  const error = !!message;

  return (
    <InputWrapper className={`textField ${error ? "error" : ""}`} valid={valid}>
      <PlaceholderLabel
        className={`textField-placeholder-label ${isValid ? "valid" : ""} ${
          value ? "active" : ""
        }`}
      >
        <CurrencyFormat
          displayType={displayType}
          isAllowed={isAllowed}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          name={name}
          onValueChange={(values) => {
            onChange({
              target: {
                name,
                value: values.value,
              },
            });
          }}
          mask={mask}
          format={format}
          autoFocus={autoFocus}
          {...props}
        />
        {label ? <Label label={label} /> : ""}
        <div className="icon">
          {!error && valid && <SuccessIcon size="1.4rem" />}
        </div>
      </PlaceholderLabel>
      <Error message={message} />
    </InputWrapper>
  );
};

export default FormattedField;
