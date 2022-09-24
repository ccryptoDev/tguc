import React, { useState, useEffect } from "react";

export const StepperContext = React.createContext();

export const StepperProvider = ({ children, steps, initStep = 0 }) => {
  const [state, setState] = useState(steps());
  const [currentStep, setCurrentStep] = useState(0);

  const getScreenData = async () => {
    const curStep = initStep;

    const updatedState = state.map((item) => {
      const updatedItem = { ...item };
      if (item.number < curStep) {
        updatedItem.completed = true;
      } else if (item.number === curStep) {
        updatedItem.active = true;
      }
      return updatedItem;
    });

    setCurrentStep(curStep);
    setState(updatedState);
  };

  useEffect(() => {
    if (initStep) {
      getScreenData();
    }
  }, [initStep]);

  const goToStep = (stepNumber) => {
    const updatedState = state.map((item) => {
      const newItem = { ...item };
      if (item.number === stepNumber) {
        newItem.active = true;
        setCurrentStep(newItem.number);
      } else {
        newItem.active = false;
      }
      return newItem;
    });
    setState([...updatedState]);
  };

  const moveToNextStep = () => {
    const index = state.findIndex((item) => item.number === currentStep);
    const newState = [...state];
    newState[index].active = false;
    newState[index].completed = true;
    newState[index + 1].active = true;
    const nextStep = newState[index + 1].number;
    setCurrentStep(nextStep);
    setState(newState);
  };

  // SEND REQUEST FROM THE TABLE OR TABLE MODAL WITH FURHTER TABLE UPDATE
  const expose = {
    goToStep,
    steps: state,
    moveToNextStep,
    currentStep,
  };
  return (
    <StepperContext.Provider value={expose}>{children}</StepperContext.Provider>
  );
};

export const useStepper = () => {
  const context = React.useContext(StepperContext);

  if (context === undefined) {
    throw new Error("table must be used within a TableProvider");
  }
  return context;
};
