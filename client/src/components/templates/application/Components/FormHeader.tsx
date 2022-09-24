import React from "react";
import styled from "styled-components";
import { H3 as Heading, Note } from "../../../atoms/Typography";

const Wrapper = styled.div`
  .note {
    margin: 2.4rem 0;
  }
`;

const FormHeader = ({ title, note }: { title: string; note?: string }) => {
  return (
    <Wrapper>
      <Heading className="heading">{title}</Heading>
      <Note className="note">{note}</Note>
    </Wrapper>
  );
};

export default FormHeader;
