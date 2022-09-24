import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import Step from "./Step";
import Accordion from "../../molecules/DropDowns/Accordion-Mui";
import { useStepper } from "../../../contexts/steps";

const Styles = styled.div`
  padding: 26px;
  background: #fff;
  .stepper-wrapper {
    margin-left: 1.4rem;
  }

  .step-wrapper:not(:last-child) {
    & .step {
      border-left: 1px solid var(--color-gray-1);
    }
  }

  & > .step-active:last-child {
    border-left: 1px solid var(--color-gray-1);
  }

  @media screen and (max-width: 900px) {
    padding: 5px;
  }
`;

const Form = () => {
  const { steps, currentStep, moveToNextStep, ...props } = useStepper();

  // JUMP TO AN ELEMENT ON HASH
  const activeElem: any = useRef();
  useEffect(() => {
    if (steps.length && currentStep) {
      const elem = document.getElementById(currentStep);
      if (elem && currentStep > 1) {
        setTimeout(() => {
          activeElem.current = elem;
          activeElem.current.scrollIntoView({
            behavior: "smooth",
          });
        }, 400);
      }
    }
  }, [steps.length, currentStep]);

  return (
    <Styles>
      <div className="stepper-wrapper">
        {steps.map((item: any) => {
          const Component: any = item.component;
          return (
            <div
              key={item.number}
              className={`step-wrapper ${item.active ? "step-active" : ""}`}
            >
              <Step {...item}>
                <div className="component-wrapper">
                  <Accordion
                    content={
                      <Component
                        moveToNextStep={moveToNextStep}
                        currentStep={currentStep}
                        isActive={item.active}
                        {...item}
                        {...props}
                      />
                    }
                    expanded={item.active}
                  />
                </div>
              </Step>
            </div>
          );
        })}
      </div>
    </Styles>
  );
};

export default Form;
