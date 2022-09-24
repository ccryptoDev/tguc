import React from "react";
import styled from "styled-components";
import { H4, Text } from "../../../components/atoms/Typography";

const Wrapper = styled.section`
  border: 1px solid var(--color-gray-2);
  padding: 24px;

  .table {
    width: 100%;
    &-head {
      & ul {
        list-style: none;
        width: 100%;
        padding-left: 16px;
        & li {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;
        }
      }
    }
    &-row {
      display: flex;
      justify-content: space-between;
      & p,
      & span {
        font-weight: 700;
      }

      &:not(:last-child) {
        padding: 16px 0;
        border-bottom: 1px solid var(--color-gray-2);
      }
      &:last-child {
        padding-top: 16px;
      }
    }
  }
`;

const Itemization = ({ offer }) => {
  return (
    <Wrapper>
      <H4 className="mb-24">Itemization of amount financed</H4>
      <div className="table">
        <div className="table-head">
          <Text>1. Cash price and taxes</Text>
          <ul>
            <li>
              <Text>A. Cash price of the Service</Text>
              <Text>$5,500.00</Text>
            </li>
            <li>
              <Text>B. Taxes on Sale</Text>

              <Text> $0.00</Text>
            </li>
          </ul>
        </div>
        <div className="table-row">
          <Text>Total cash price and taxes</Text>

          <Text>$5,500.00</Text>
        </div>
        <div className="table-row">
          <Text>2. Amount Paid to Others</Text>

          <Text>$0.00</Text>
        </div>
        <div className="table-row">
          <Text>3. Total (1 + 2) </Text>

          <Text>$5,500.00</Text>
        </div>
        <div className="table-row">
          <Text>4. Down Payment </Text>

          <Text>$1,500.00</Text>
        </div>
        <div className="table-row">
          <Text>5. Total Amount Financed (4 less 5) </Text>

          <Text>$4,000.00</Text>
        </div>
      </div>
    </Wrapper>
  );
};

export default Itemization;
