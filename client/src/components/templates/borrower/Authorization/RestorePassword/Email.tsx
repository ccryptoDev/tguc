import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { renderEmailField, initRestorePasswordForm } from "../config";
import { H2 as Heading } from "../../../../atoms/Typography";
import Buttons from "../../../../atoms/Form/Buttons-wrapper";
import Button from "../../../../atoms/Buttons/Button";
import Form, { FormWrapper } from "../styles";
import ActionButton from "../../../../molecules/Buttons/ActionButton";
import { routes } from "../../../../../routes/Borrower/routes";
import { validateEmail } from "../../../../../utils/validators/email";

const FormComponent = ({ cb, nextPage }: { cb: any; nextPage: any }) => {
  const history = useHistory();

  const [form, setForm] = useState(initRestorePasswordForm());

  const onChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prevState: any) => ({
      ...prevState,
      [name]: { ...prevState[name], value, message: "" },
    }));
  };

  const onSubmitHandler = async (e: any) => {
    e.preventDefault();
    const isEmailValid = validateEmail(form.email.value);
    if (isEmailValid) {
      cb(form);
      nextPage();
    } else {
      setForm((prevState: any) => ({
        ...prevState,
        email: { ...prevState.email, message: "Enter a valid email" },
      }));
    }
  };

  return (
    <FormWrapper>
      <ActionButton onClick={() => history.push(routes.LOGIN)} type="goback" />
      <Form onSubmit={onSubmitHandler}>
        <Heading className="heading">
          Recover Your{" "}
          <span>
            Password<span>.</span>
          </span>
        </Heading>
        {renderEmailField(form).map(({ component: Component, ...field }) => {
          return <Component {...field} onChange={onChange} key={field.name} />;
        })}

        <Buttons>
          <Button type="submit" variant="contained">
            Continue
          </Button>
        </Buttons>
      </Form>
    </FormWrapper>
  );
};

export default FormComponent;
