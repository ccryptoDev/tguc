import React from "react";
import styled from "styled-components";
import { Text } from "../../../components/atoms/Typography";

const Wrapper = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  .item {
    padding: 16px;
    border: 1px solid var(--color-gray-2);
    border-bottom: none;
    display: flex;
    flex-direction: column;
    row-gap: 16px;
    & > p {
      margin: 0;
    }

    &:nth-child(odd) {
      border-right: none;
    }
    &:nth-last-child(1),
    &:nth-last-child(2) {
      border-bottom: 1px solid var(--color-gray-2);
    }
  }

  @media screen and (max-width: 767px) {
    & .item {
      flex-direction: column;
      align-items: start;
      row-gap: 8px;

      & .value {
        text-align: left;
      }
    }
  }
`;

const AddressInfo = ({ ricData }) => {
  return (
    <Wrapper>
      <div className="item">
        <Text>
          <b>Buyer&apos;s Name and Address </b>
        </Text>
        <Text>Temeka Adams</Text>
        <Text>8180 Briarwood Street 1, Stanton, CA, 90680</Text>
      </div>
      <div className="item">
        <Text>
          <b>Date of Contract </b>
        </Text>
        <Text>10/14/2021</Text>
      </div>
      <div className="item">
        <Text>
          <b>Co-Buyer&apos;s Name and Address</b>
        </Text>
        <Text>---</Text>
      </div>
      <div className="item">
        <Text>
          <b>Contract No </b>
        </Text>
        <Text>APL_11170</Text>
      </div>
      <div className="item">
        <Text>
          <b>Seller&apos;s Name </b>
        </Text>
        <Text>Pompeii Surgical</Text>
      </div>
      <div className="item">
        <Text>
          <b>Seller&apos;s Contract Information </b>
        </Text>
        <Text>619-874-9663, contact@pompeiisurgical.com</Text>
      </div>
    </Wrapper>
  );
};

export default AddressInfo;
