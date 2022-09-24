import React from "react";
import styled from "styled-components";
import { H4 } from "../../../atoms/Typography";
import ErrorMessage from "../../Form/Elements/FormError";

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 1rem;
`;

type IDetailsHeading = {
  text: string;
  message?: string;
};

const Heading = ({ text, message }: IDetailsHeading) => {
  return (
    <Wrapper>
      <H4>{text}</H4>
      <ErrorMessage message={message} />
    </Wrapper>
  );
};

export default Heading;
