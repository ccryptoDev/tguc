import styled from "styled-components";

export default styled.form`
  max-width: 300px;
  width: 100%;
  & .form-item {
    display: flex;
    align-items: center;
    margin: 2.4rem 0;

    & input {
      line-height: 1.5;
    }

    & .form-item-icon {
      padding-right: 1rem;
    }
  }
  & .textField {
    width: 100%;
    text-align: left;
  }

  .forgotPasswordBtn {
    padding: 1rem 5px;
    & a {
      font-size: 1.3rem;
      text-decoration: none;

      &,
      &:visited,
      &:active {
        color: #034376;
      }
    }
  }

  & .button-wrapper {
    display: flex;
    justify-content: center;
    padding: 10px;
    column-gap: 10px;
  }

  .errorMessage {
    padding: 0;
  }
`;
