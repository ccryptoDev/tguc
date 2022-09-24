import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import TextField from "../../../../molecules/Form/Fields/TextField/Placeholder-label";
import Form from "./Styles";
import { validateEmail } from "../../../../../utils/validators/email";
import Button from "../../../../atoms/Buttons/Button";
import { forgotPassword } from "../../../../../api/admin-dashboard/login";
import ErrorMessage from "../../../../molecules/ErrorMessage/FormError";

const FormComponent = () => {
  const history = useHistory();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: {
      value: "",
      message: "",
      required: true,
    },
  });
  const onChangeHandler = (e) => {
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
    const isValid = validateEmail(form.email.value);
    // if the form is valid the validated form will have the parsed format for the http request, otherwise it will keep the state's format
    if (!isValid) {
      // if not valid display the form with error messages
      setForm((prevState) => ({
        ...prevState,
        email: { ...prevState.email, message: "Enter a valid email" },
      }));
    } else {
      const email = form.email.value;
      const result = await forgotPassword(email);
      if (result && !result.error) {
        toast.success("Email with a new password has been sent!");
      } else {
        const message = result?.error?.message || "something went wrong";
        setError(message);
      }
    }
  };
  return (
    <Form onSubmit={onSubmitHandler}>
      <div className="form-item">
        <TextField
          name="email"
          value={form.email.value}
          onChange={onChangeHandler}
          message={form.email.message}
          label="Email"
        />
      </div>
      <ErrorMessage message={error} />
      <div className="button-wrapper">
        <Button
          type="button"
          variant="outlined"
          onClick={() => history.goBack()}
        >
          Go Back
        </Button>
        <Button type="submit" variant="contained">
          Send Email
        </Button>
      </div>
    </Form>
  );
};

export default FormComponent;
