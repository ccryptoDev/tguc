import React from "react";
import styled from "styled-components";
import { Text, Caption } from "../../../../../atoms/Typography";
import { formatCurrency } from "../../../../../../utils/formats";

const Button = styled.button`
  display: flex;
  justify-content: space-between;
  background: #fff;
  border: 1px solid #ebebeb;
  padding: 16px;
  text-align: left;

  .contractor {
    &-heading {
      font-weight: 700;
    }

    &-description {
      & span:nth-child(2) {
        padding: 0 10px;
        margin: 6px 0;
        position: relative;
      }
    }
    &-amount {
      &-label {
        font-size: 12px;
        line-height: 1.5;
        font-weight: 400;
      }
      &-value span {
        font-weight: 600;
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
    & .contractor-indicator {
      border-color: var(--color-blue-1);
      background: var(--color-blue-1);
    }
  }
`;

export type IContractorProps = {
  name: string;
  location: string;
  amount: number;
  onClick: any;
  contractorSelected: string;
};

const Contractor = ({
  onClick,
  amount,
  location,
  name,
  contractorSelected,
}: IContractorProps) => {
  const active = contractorSelected === name;
  return (
    <Button
      type="button"
      onClick={() => onClick(name)}
      className={`contractor ${active ? "selected" : ""}`}
    >
      <div className="contractor-content">
        <Text className="contractor-heading">{name}</Text>
        <Caption className="contractor-description">
          <span>{location}</span>
        </Caption>
        <Text className="contractor-amount">
          <span className="contractor-amount-label">Pending estimate: </span>
          <span className="contractor-amount-value">
            {formatCurrency(amount)}
          </span>
        </Text>
      </div>
      <div className="contractor-indicator" />
    </Button>
  );
};

export default Contractor;
