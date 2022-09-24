import styled from "styled-components";

export const FormWrapper = styled.div`
  max-width: 460px;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  .heading {
    text-align: center;
    margin-bottom: 12px;
    &,
    span {
      font-size: 32px;
      line-height: 36px;
      font-weight: 700;
    }
    & > span {
      white-space: nowrap;
      & > span {
        color: var(--color-primary);
      }
    }
  }

  .errorMessage {
    padding: 0;
    font-size: 14px;
  }

  button {
    &:hover {
      box-shadow: none;
    }
  }

  .note {
    margin: 16px 0;
  }

  @media screen and (max-width: 450px) {
    .heading {
      text-align: left;
    }
  }
`;

export default Form;
