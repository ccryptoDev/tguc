import styled from "styled-components";

export default styled.form`
  padding: 2rem 2rem;
  max-width: 480px;
  box-sizing: border-box;
  .layout {
    position: relative;
    display: grid;
    grid-template-columns: 2fr 2fr;
    grid-gap: 2rem;
    margin-bottom: 4rem;

    .errorMessage {
      position: absolute;
      top: 100%;
      padding: 0;
      margin-top: 1rem;
      width: 100%;
      font-size: 12px;
    }

    & .textField:nth-child(1),
    & .textField:nth-child(6),
    & .textField:nth-child(7) {
      grid-column: 1 / -1;
    }
  }

  .checkbox-wrapper {
    & label {
      display: flex;
      align-items: center;
    }
  }
`;

export const PasswordWrapper = styled.div<{ show: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  .textField {
    opacity: ${(props) => (props.show && 1) || 0.4};
  }
`;
