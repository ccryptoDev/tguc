import React from "react";
import styled from "styled-components";
import { Text, Caption } from "../../../../../atoms/Typography";

const Button = styled.button`
  display: flex;
  justify-content: space-between;
  background: #fff;
  border: 1px solid #ebebeb;
  padding: 16px;
  text-align: left;

  .offer {
    &-heading {
      margin-bottom: 6px;
      font-weight: 700;
    }

    &-description {
      & span:nth-child(2) {
        padding: 0 10px;
        position: relative;
        &:after,
        &:before {
          content: "";
          position: absolute;
          background: var(--color-main);
          height: 2px;
          width: 2px;
          border-radius: 50%;
          top: 50%;
          transform: translateY(-50%);
        }

        &:before {
          left: 4px;
        }
        &:after {
          right: 4px;
        }
      }
    }
    &-indicator {
      width: 13px;
      height: 13px;
      border: 1px solid var(--color-main);
      border-radius: 50%;
    }
  }
  &.selected {
    border-color: var(--color-blue-1);
    & .offer-indicator {
      border-color: var(--color-blue-1);
      background: var(--color-blue-1);
    }
  }
`;

export type IOfferProps = {
  apr: number;
  payment: number;
  amount: number;
  term: number;
  onClick: any;
  termSelected: number;
};

const Offer = ({
  onClick,
  apr,
  amount,
  payment,
  term,
  termSelected,
}: IOfferProps) => {
  const active = termSelected === term;
  return (
    <Button
      type="button"
      onClick={() => onClick(term)}
      className={`offer ${active ? "selected" : ""}`}
    >
      <div className="offer-content">
        <Text className="offer-heading">${payment}/ mo</Text>
        <Caption className="offer-description">
          <span>{term} months term</span>
          <span>{apr}% APR</span>
          <span>${amount} Financed</span>
        </Caption>
      </div>
      <div className="offer-indicator" />
    </Button>
  );
};

export default Offer;
