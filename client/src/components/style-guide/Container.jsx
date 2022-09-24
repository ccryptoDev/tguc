import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  padding: 16px;
  max-width: 50%;
  border: 2px solid #3672bd;
  & .content {
    display: flex;
    flex-direction: column;
    row-gap: 16px;
  }

  & .header {
    padding: 20px;
    background: #3672bd;
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 16px;
  }
`;

const Container = ({ children, sectionName }) => {
  return (
    <Wrapper>
      <div className="header">{sectionName}</div>
      <div className="content">{children}</div>
    </Wrapper>
  );
};

export default Container;
