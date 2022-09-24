import React from "react";
import styled from "styled-components";

const PasswordRule = styled.div`
  font-size: 14px;
`;

const PasswordNote = ({ className }: { className?: string }) => {
  return (
    <PasswordRule className={className}>
      <b>Password requirements:</b> Minimum 8 characters, at least 1 letter, 1
      number and 1 special character
    </PasswordRule>
  );
};

export default PasswordNote;
