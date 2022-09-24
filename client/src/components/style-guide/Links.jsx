import React from "react";
import styled from "styled-components";
import Link from "../atoms/Buttons/Link";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 10px;
`;

const Links = () => {
  return (
    <Wrapper>
      <Link to="/">Link</Link>
    </Wrapper>
  );
};

export default Links;
