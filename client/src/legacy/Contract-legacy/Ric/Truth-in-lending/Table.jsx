/* eslint-disable react/no-unescaped-entities */
import React from "react";
import styled from "styled-components";
import {
  Text as Amount,
  Caption as Heading,
  CaptionSmall as Note,
} from "../../../../components/atoms/Typography";

const Wrapper = styled.section`
  display: flex;
  position: relative;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-gray-2);

  @media screen and (max-width: 992px) {
    & {
      flex-wrap: wrap;

      & .cube {
        width: 50%;
        padding-top: 50%;
      }
    }
  }
  }
`;

const CubeWrapper = styled.div`
  &:not(:last-child) {
    border-right: none;
  }
  border: 1px solid var(--color-border);
  word-break: break-word;
  box-sizing: border-box;
  width: 20%;
  padding-top: 20%;
  position: relative;
  .cube-content {
    top: 0;
    left: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    position: absolute;
    padding-right: 16px;
  }

  @media screen and (max-width: 560px) {
    width: 100%;
    position: relative;

    &-content {
      position: relative;
    }
  }
`;

const cubes = () => [
  {
    heading: "Annual Percentage Rate",
    note: "The Cost of your credit as an annual rate",
    amount: "16.9%",
  },
  {
    heading: "Finance Charge",
    note: "The dollar Amount the credit will cost you",
    amount: "$316.32",
  },
  {
    heading: "Amount Financed",
    note: "The amount of credit provided to you or on your behalf",
    amount: "$4,000.00",
  },
  {
    heading: "Total of Payments",
    note: "The amount you will have paid after you made all payments as scheduled.",
    amount: "$4,316.32",
  },
  {
    heading: "Total Sale Price",
    note: "The total cost of your purchase on credit, including your down payment of $1,500.00",
    amount: "$5,816.32",
  },
];

const Cube = ({ heading, amount, note }) => {
  return (
    <CubeWrapper className="cube">
      <div className="cube-content">
        <Heading>
          <b>{heading}</b>
        </Heading>
        <Note>{note}</Note>
        <Amount>
          <b>{amount}</b>
        </Amount>
      </div>
    </CubeWrapper>
  );
};

function TinLTable({ maturityDate = "--", offer }) {
  return (
    <Wrapper className="table">
      {cubes().map((item) => {
        return <Cube key={item.heading} {...item} />;
      })}
    </Wrapper>
  );
}

export default TinLTable;
