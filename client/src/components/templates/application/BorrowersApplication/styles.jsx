import styled from "styled-components";

const Container = styled.div`
  width: 100%;
  max-width: 724px;
  border: 1px solid var(--color-grey-light);
  border-radius: 1.4rem;
  background: #fff;
  padding: 0 2.4rem 2.4rem 0;

  @media screen and (max-width: 767px) {
    padding: 0;
  }
`;

export default Container;
