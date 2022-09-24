import React from "react";
import styled from "styled-components";
import emailImg from "../../../../assets/svgs/email.svg";
import phoneImg from "../../../../assets/svgs/phone.svg";
import { Text } from "../../../atoms/Typography";

const InfoBlock = styled.div`
  padding: 2.6rem;
  background: var(--color-blue-4);
  width: 100%;

  a:link,
  a:visited,
  a:active {
    font-size: 1.4rem;
    line-height: 1.5;
    font-weight: 700;
    text-decoration: none;
    color: var(--color-blue-1);
    margin-top: 2.6rem;
    display: block;
  }
`;

export const Email = () => {
  return (
    <InfoBlock>
      <img src={emailImg} alt="email" />
      <Text>
        <a href="mailto:contact@tgucfinancial.com">contact@tgucfinancial.com</a>
      </Text>
    </InfoBlock>
  );
};

export const Phone = () => {
  return (
    <InfoBlock>
      <img src={phoneImg} alt="phone" />
      <Text>
        <a href="tel:877-744-1396">877-744-1396</a>
      </Text>
    </InfoBlock>
  );
};
