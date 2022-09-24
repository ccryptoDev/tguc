import React from "react";
import styled from "styled-components";
import {
  H1,
  H2,
  H3,
  H4,
  Text,
  Caption,
  CaptionSmall,
} from "../atoms/Typography";

const Wrapper = styled.div``;

const Component = () => {
  return (
    <Wrapper>
      <H1>H1 - Poppins / Bold / 56</H1>
      <H2>H2 - Poppins / Bold / 32</H2>
      <H3>H3 - Poppins / Bold / 24</H3>
      <H4>H4 - Poppins / Bold / 18</H4>
      <Text>Text - Poppins / Regular / 14</Text>
      <Caption>Caption - Poppins / Regular / 12</Caption>
      <CaptionSmall>CaptionSmall - Poppins / Regular / 10</CaptionSmall>
    </Wrapper>
  );
};

export default Component;
