import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  background: #fff;
  border: 1px solid var(--color-gray-2);
  padding: 2.4rem;

  ul {
    list-style: none;

    & li {
      margin-top: 1rem;
    }
  }

  .note {
    font-size: 1.4rem;
    line-height: 1.6rem;
    font-weight: 400;
    font-weight: normal;
    color: #222222;
    &.error {
      color: red;
    }
  }
`;

export default Wrapper;
