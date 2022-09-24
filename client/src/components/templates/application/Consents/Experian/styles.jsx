import styled from "styled-components";

const Wrapper = styled.div`
  line-height: 1.5;
  ol {
    padding-left: 2rem;
  }
  p {
    margin: 1.6rem 0;
  }

  h2,
  h3 {
    color: var(--color-blue-1);
  }

  .no-break {
    page-break-inside: avoid;
  }

  .footer {
    margin-top: 5rem;
    font-size: 12px;
    display: flex;
    align-items: end;
    justify-content: end;
    & .left {
      width: 20rem;
      padding: 0 1rem;
    }
    & .right {
      padding: 0 1rem;
      width: 40rem;
      border-left: 2px solid;
      display: flex;
      flex-direction: column;
      row-gap: 5px;
    }
  }
`;

export default Wrapper;
