import React, { useState } from "react";
import styled from "styled-components";
import Input from "../../../../../molecules/Form/Fields/FormattedField/Placeholder-label";
import Header from "../../../Components/FormHeader";
import Button from "../../../../../atoms/Buttons/Button";
import { validateForm } from "./validate";
import { initForm } from "./config";
import { mockRequest } from "../../../../../../utils/mockRequest";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";
import { sendCompletedApplicationEmail } from "../../../../../../api/application";

const Wrapper = styled.div`
  form {
    max-width: 320px;
    margin: 20px 0;

    button {
      margin: 20px 0;
      width: 100%;
    }
  }
`;

const SocialSecurityNumber = ({ moveToNextStep }: { moveToNextStep: any }) => {
  const [form, setForm] = useState(initForm());
  const [loading, setLoading] = useState(false);
  const onSubmitHandler = async (e: any) => {
    e.preventDefault();
    const [isValid, updatedForm] = validateForm(form);
    if (isValid) {
      setLoading(true);

      const userToken: any = window.localStorage.getItem("userToken");
      if (!userToken) {
        return;
      }
      const user = JSON.parse(userToken);

      await sendCompletedApplicationEmail(user.id);

      await mockRequest();
      setLoading(false);
      moveToNextStep();
    } else {
      setForm(updatedForm);
    }
  };

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevState: any) => ({
      ...prevState,
      [name]: { ...prevState[name], value, message: "" },
    }));
  };

  return (
    <Wrapper>
      <Header
        title="Enter Your Social Security Number"
        note="We are collecting this information to reflect it on your credit history"
      />
      <form onSubmit={onSubmitHandler}>
        <Loader loading={loading}>
          <Input
            value={form.ssn.value}
            label="Social Security Number"
            message={form.ssn.message}
            name="ssn"
            format="###-##-####"
            placeholder="XXX-XX-XXXX"
            onChange={onChangeHandler}
          />
          <Button type="submit" variant="contained">
            Continue
          </Button>
        </Loader>
      </form>
    </Wrapper>
  );
};

export default SocialSecurityNumber;
