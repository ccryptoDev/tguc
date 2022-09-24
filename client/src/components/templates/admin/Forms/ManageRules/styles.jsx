import styled from "styled-components";

export const Wrapper = styled.div`
  font-family: "OpenSans";
  font-size: 1.4rem;
  line-height: 1rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  row-gap: 20px;
  &* {
    line-height: 1.5;
  }
  .row {
    display: flex;
  }
  .key {
    padding-right: 1rem;
  }
  .heading-wrapper {
    display: flex;
  }

  .verticals-wrapper {
    display: flex;
    flex-direction: column;
    row-gap: 20px;

    .dropdown-heading-value {
      line-height: 1.5;
      font-family: Poppins;
    }
  }
`;

export const Offers = styled.ul`
  display: flex;
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

export const Banks = styled.div`
  margin-left: 1em;
  display: flex;
  height: 100%;
  background: var(--dashboard-bg-color);
  backdrop-filter: blur(5rem);
`;
