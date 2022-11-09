import React from "react";
import styled from "styled-components";
import { useStepper } from "../../../contexts/steps";
import stepCompletedImg from "../../../assets/svgs/Steps/completed.svg";
import stepActiveImg from "../../../assets/svgs/Steps/active.svg";
import stepIncompleteImg from "../../../assets/svgs/Steps/incomplete.svg";

const Styles = styled.div`
  min-height: 8rem;
  padding: 0 0 1.2rem 3rem;
  position: relative;

  .step-number {
    position: absolute;
    border-radius: 50%;
    padding: 0.6rem;
    top: 0.6rem;
    left: 0;
    transform: translate(-50%, -20%);
    background: #fff;
  }

  .step-number-inner,
  .step-edit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 2rem;
    width: 2rem;
    line-height: 1.2rem;
    font-weight: 700;
  }

  .step-number-inner {
    border-radius: 50%;
  }

  .step-edit-btn {
    background: #fff;
    color: var(--color-blue-1);
    transform: translate(0, 0);
    border: none;
    font-size: 1.2rem;
  }

  & > .heading-wrapper {
    display: flex;
    align-items: center;
    & .heading {
      font-weight: 700;
      position: relative;
      font-size: 12px;
      line-height: 3rem;
      display: flex;
      align-items: center;
      column-gap: 1.2rem;
    }
  }

  .content-wrapper {
    padding: 0;
    opacity: 0;
    visibility: hidden;
  }

  .active .content-wrapper {
    opacity: 1;
    visibility: visible;
  }

  .completed img {
    & path {
      fill: #fff;
    }
  }

  @media screen and (max-width: 767px) {
    & {
      padding: 0 0 1.2rem 1.6rem;
    }
  }
`;

type IStepProps = {
  number: string;
  name: string;
  completed: boolean;
  active: boolean;
  editable: boolean;
  children: any;
};

const Step = ({
  number,
  name,
  completed,
  editable,
  active,
  children,
}: IStepProps) => {
  const { goToStep } = useStepper();

  const renderStepIcon = () => {
    switch (true) {
      case active:
        return stepActiveImg;
      case completed:
        return stepCompletedImg;
      default:
        return stepIncompleteImg;
    }
  };

  return (
    <Styles className="step">
      <div className="step-number" id={number}>
        <img src={renderStepIcon()} alt={number} />
      </div>
      <div className="heading-wrapper">
        <div
          className="heading"
          style={{
            color: active ? "var(--color-blue-1)" : "var(--color-gray-1)",
          }}
        >
          {name}
          {completed && !active && editable ? (
            <button
              type="button"
              className="step-edit-btn"
              onClick={() => goToStep(number)}
            >
              Edit
            </button>
          ) : (
            ""
          )}
        </div>
      </div>
      <div className={`${active ? "active" : ""}`}>
        <div className="content-wrapper">{children}</div>
      </div>
    </Styles>
  );
};

export default Step;
