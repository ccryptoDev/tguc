import styled from "styled-components";
import Button from "../../../../../atoms/Buttons/Button";

export const AddButton = styled(Button)`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  padding: 0;
`;

const Wrapper = styled.div`
  .fields {
    display: flex;
    align-items: center;
    column-gap: 20px;
    margin-top: 10px;

    /* MULTI SELECT STYLES */
    & .multi-select > * {
      z-index: 300;
    }
    & .multi-select {
      & .dropdown-container {
        width: 400px;
      }
      & .dropdown-heading-value {
        max-width: 500px;
        width: 100%;
      }
    }

    & .field-wrapper {
      position: relative;
      & .heading {
        margin-bottom: 5px;
      }
      & .dropdown-heading-value {
        line-height: 1.5;
      }
    }

    /* ----- */
    .buttons-wrapper {
      display: flex;
      column-gap: 20px;

      & button {
        max-width: 200px;
        width: 100%;
      }
    }
  }
  .buttons-wrapper-center {
    height: 100px;
    position: relative;
    width: 100%;
  }
  .buttons-center {
    margin: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
  }

  .table-container {
    max-width: 1270px;
    margin: 20px 0;
  }

  .field-wrapper {
    & .error {
      position: absolute;
      top: 100%;
    }
  }
`;

export default Wrapper;
