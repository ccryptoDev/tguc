import styled from "styled-components";

const Wrapper = styled.ul`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 20px;
  height: 100%;
  background: var(--dashboard-bg-color);
  backdrop-filter: blur(5rem);
  font-size: 15px;
  max-width: 900px;
  list-style: none;
  column-gap: 20px;

  li {
    display: flex;
    column-gap: 5px;
    align-items: start;
    padding: 1rem;
    border: 1px solid var(--color-border);
    & .label {
      display: flex;
      flex-direction: column;
      row-gap: 10px;
    }
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  row-gap: 24px;
`;

export default Wrapper;
