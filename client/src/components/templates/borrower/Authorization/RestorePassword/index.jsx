import React, { useState } from "react";
import styled from "styled-components";
import EmailForm from "./Email";
import Success from "./Success";
import { forgotPassword } from "../../../../../api/admin-dashboard/login";

const Wrapper = styled.div`
  display: flex;
  align-items: flex-start;
  button[type="submit"] {
    width: 100%;
  }
  .note {
    text-align: center;
    & button {
      color: var(--color-primary);
      font-weight: 700;
      font-size: 14px;
      background: transparent;
      border: none;
      display: inline;
    }
  }

  @media screen and (max-width: 500px) {
    .heading {
      padding-left: 60px;
      text-align: left;
    }

    .action-button {
      position: absolute;
    }
  }
`;

function FormComponent() {
  const [emailResponse, setEmailResponse] = useState(null);
  const [page, setPage] = useState(0);

  const submitBtn = async (data) => {
    const res = await forgotPassword(data.email.value, false);
    setEmailResponse();
  };

  return (
    <Wrapper>
      {page ? (
        <Success prevPage={() => setPage(0)} emailResponse={emailResponse} />
      ) : (
        <EmailForm cb={submitBtn} nextPage={() => setPage(1)} />
      )}
    </Wrapper>
  );
}

export default FormComponent;
