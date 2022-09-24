import styled from "styled-components";

const Wrapper = styled.div`
  .fields {
    display: grid;
    grid-template-columns: 500px;
    margin-top: 10px;
    grid-gap: 20px;
    & .multi-select > * {
      z-index: 300;
    }
    & .multi-select {
      & .dropdown-heading-value {
        max-width: 500px;
        width: 100%;
      }
    }

    & .field-wrapper {
      & .heading {
        margin-bottom: 5px;
      }
      & .dropdown-heading-value {
        line-height: 1.5;
      }
    }
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
  .fields-zipcode {
    display: grid;
    grid-template-columns: 33% 33% 33%;
    margin: 20px 0;
    grid-gap: 20px;
    align-items: center;

    & .textField {
      position: relative;
      & .error {
        position: absolute;
        top: 100%;
      }
    }
  }
`;

export default Wrapper;
