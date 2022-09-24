import React, { useState, useEffect } from "react";
import Header from "../../../Components/FormHeader";
import Container from "../../styles";
import Editing from "./Form/Editing";
import Registration from "./Form/Registration";

const FormComponent = ({
  isActive = false,
  completed = false,
  moveToNextStep,
}: {
  isActive: boolean;
  completed: boolean;
  moveToNextStep: any;
}) => {
  const [edit, setEdit] = useState(false);
  useEffect(() => {
    if (isActive && completed) {
      setEdit(true);
    }
  }, [isActive]);

  return (
    <Container>
      <Header
        title="Personal Information"
        note="This will not affect your credit score"
      />
      {edit ? (
        <Editing moveToNextStep={moveToNextStep} />
      ) : (
        <Registration moveToNextStep={moveToNextStep} />
      )}
    </Container>
  );
};

export default FormComponent;
