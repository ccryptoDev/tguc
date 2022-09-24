import React, { useState } from "react";
import { Link } from "react-router-dom";
import PasswordField from "../../../../molecules/Form/Fields/Password/Placeholder-label";
import TextField from "../../../../molecules/Form/Fields/TextField/Placeholder-label";
import { validateLogin } from "../../../../../utils/validators/login";
import Form from "./Styles";
import { adminLogin } from "../../../../../api/admin-dashboard/login";
import { useUserData } from "../../../../../contexts/admin";
import ErrorMessage from "../../../../molecules/Form/Elements/FormError";
import Loader from "../../../../molecules/Loaders/LoaderWrapper";
import Button from "../../../../atoms/Buttons/Button";
import { routes } from "../../../../../routes/Admin/routes.config";

const FormComponent = () => {
  const { fetchUser } = useUserData();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    password: { value: "", message: "", required: true },
    email: {
      value: "",
      message: "",
      required: true,
    },
  });
  const onChangeHanlder = (e) => {
    setForm((prevState) => {
      return {
        ...prevState,
        [e.target.name]: {
          ...prevState[e.target.name],
          value: e.target.value,
          message: "",
        },
      };
    });
  };
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // validate and parse the form to the request format
    const { isValid, validatedForm } = validateLogin(form);
    // if the form is valid the validated form will have the parsed format for the http request, otherwise it will keep the state's format
    if (!isValid) {
      // if not valid display the form with error messages
      setForm((prevState) => {
        return { ...prevState, ...validatedForm };
      });
    } else {
      setLoading(true);
      const result = await adminLogin(validatedForm);
      if (result && typeof result.token === "string") {
        // after the token is set, check the user and trigger the dom tree to re-render;
        fetchUser();
      } else if (result.error) {
        setError("Wrong credintials");
        setLoading(false);
      }
    }
  };
  return (
    <Loader loading={loading}>
      <Form onSubmit={onSubmitHandler}>
        <div className="form-item">
          <TextField
            name="email"
            value={form.email.value}
            onChange={onChangeHanlder}
            message={form.email.message}
            label="Email"
          />
        </div>
        <div className="form-item">
          <PasswordField
            name="password"
            value={form.password.value}
            onChange={onChangeHanlder}
            message={form.password.message}
            label="Password"
          />
        </div>
        <div className="forgotPasswordBtn">
          <Link to={routes.FORGOT_PASSWORD}>Forgot password?</Link>
        </div>
        <ErrorMessage message={error} />
        <div className="button-wrapper">
          <Button variant="outlined" type="submit">
            Sign in
          </Button>
        </div>
      </Form>
    </Loader>
  );
};

export default FormComponent;
