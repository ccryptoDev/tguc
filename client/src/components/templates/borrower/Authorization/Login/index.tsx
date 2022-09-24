import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import Buttons from "../../../../atoms/Form/Buttons-wrapper";
import Button from "../../../../atoms/Buttons/Button";
import { initLoginForm, renderLoginFormFields, validate } from "./config";
import { routes } from "../../../../../routes/Borrower/routes";
import { login } from "../../../../../api/authorization";
import Loader from "../../../../molecules/Loaders/LoaderWrapper";
import ErrorMessage from "../../../../molecules/Form/Elements/FormError";
import { Note } from "../../../../atoms/Typography";
import Form, { FormWrapper } from "../styles";
import { useUserData } from "../../../../../contexts/user";

const FormComponent = () => {
  const [form, setForm] = useState<any>(initLoginForm());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const history = useHistory();
  const { fetchUser } = useUserData();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevState: any) => ({
      ...prevState,
      [name]: { ...prevState[name], value, message: "" },
    }));
  };

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const [isValid, updatedForm] = validate(form);
    if (isValid) {
      setLoading(true);
      const result = await login({
        email: form?.email?.value,
        password: form?.password?.value,
      });

      if (result && !result.error) {
        fetchUser();
      } else if (result?.error) {
        const message = result?.error?.message;
        setError(message);
      }
      setLoading(false);
    } else {
      setForm(updatedForm);
    }
  };

  return (
    <FormWrapper>
      <Loader loading={loading}>
        <Form onSubmit={onSubmitHandler}>
          <h2 className="heading">Log in to your account</h2>

          {renderLoginFormFields(form).map(
            ({ component: Component, ...field }) => {
              return (
                <Component {...field} onChange={onChange} key={field.name} />
              );
            }
          )}
          <ErrorMessage message={error} />
          <Buttons>
            <Button type="submit" variant="contained" className="wide">
              Log In
            </Button>
          </Buttons>
          <Note className="note">
            <Link to={routes.FORGOT_PASSWORD} className="link">
              Forgot your password?
            </Link>
          </Note>
        </Form>
      </Loader>
    </FormWrapper>
  );
};

export default FormComponent;
