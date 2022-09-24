import styled from "styled-components";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  row-gap: 2.4rem;

  .fields-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 12px;
  }
  .file-fields-wrapper {
    margin: 2rem 0;
  }

  @media screen and (max-width: 700px) {
    .fields-wrapper {
      grid-template-columns: 1fr;
    }

    .heading {
      display: none;
    }
  }
`;

export default Form;
