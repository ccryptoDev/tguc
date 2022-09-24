import styled from "styled-components";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  row-gap: 2.4rem;

  .contractor-fields-wrapper {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-gap: 12px;
  }

  & .textField {
    &:nth-child(1),
    &:nth-child(4),
    &:nth-child(11) {
      grid-column: 1 / 5;
    }

    &:nth-child(2),
    &:nth-child(5),
    &:nth-child(12) {
      grid-column: 5 / 9;
    }

    &:nth-child(3),
    &:nth-child(6),
    &:nth-child(13) {
      grid-column: 9 / 13;
    }

    &:nth-child(7),
    &:nth-child(9) {
      grid-column: 1 / 7;
    }
    &:nth-child(8),
    &:nth-child(10) {
      grid-column: 7 / 13;
    }

    &:nth-child(14) {
      grid-column: 5 / -1;
    }
  }

  .company-fields-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 12px;
  }

  @media screen and (max-width: 650px) {
    .contractor-fields-wrapper {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  }
  @media screen and (max-width: 500px) {
    .textField:first-child {
      margin-top: 12px;
    }
  }
`;

export default Form;
