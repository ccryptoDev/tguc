import React from "react";
import styled from "styled-components";
import { H4 } from "../../../../components/atoms/Typography";
import Table from "./Table";
import Details from "./Details";

const Wrapper = styled.div`
  border: 1px solid var(--color-gray-2);
  padding: 24px;
`;

const TinL = ({ maturityDate = "--", offer }) => {
  return (
    <Wrapper>
      <H4 className="mb-24">Federal truth in lending act disclosures</H4>
      <Table maturityDate={maturityDate} offer={offer} />
      <Details />
    </Wrapper>
  );
};

export default TinL;
