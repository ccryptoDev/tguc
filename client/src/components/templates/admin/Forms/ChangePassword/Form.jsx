import React, { useState } from "react";
import { toast } from "react-toastify";
import { cloneDeep } from "lodash";
import { useHistory } from "react-router-dom";
import Form from "./Styles";
import Buttons from "../../../../molecules/Buttons/SubmitForm";
import ErrorMessage from "../../../../molecules/ErrorMessage/FormError";
import Loader from "../../../../molecules/Loaders/LoaderWrapper";
import { initialForm, fields } from "./config";
import Button from "../../../../atoms/Buttons/Button";
import { useUserData } from "../../../../../contexts/admin";
import { validatePassword } from "../../../../../utils/validators/password";
import { updateAdminById } from "../../../../../api/admin-dashboard";
import PasswordNote from "../../../../molecules/Form/Elements/PasswordNote";

const FormComponent = () => {
  const [form, setForm] = useState(cloneDeep(initialForm));
  const {
    user: { user },
  } = useUserData();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const history = useHistory();

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
    const [isValid, passwordMessage, repasswordMessage] = validatePassword({
      password: form.password.value,
      repassword: form.repassword.value,
    });
    debugger;
    // if the form is valid the validated form will have the parsed format for the http request, otherwise it will keep the state's format
    if (!isValid) {
      // if not valid display the form with error messages
      setForm((prevState) => ({
        password: { ...prevState.password, message: passwordMessage },
        repassword: { ...prevState.repassword, message: repasswordMessage },
      }));
    } else if (user?.data?.id) {
      setLoading(true);
      const result = await updateAdminById({
        id: user.data?.id,
        password: form.password.value,
      });
      if (result && !result.error) {
        toast.success("password has been updated");
      } else {
        toast.error("sorry, we failed to reset your password!");
        setMessage("something went wrong...");
      }
      setLoading(false);
    }
  };
  return (
    <>
      <Loader loading={loading}>
        <Form onSubmit={onSubmitHandler}>
          {!form.password.message && <PasswordNote />}
          {fields(form).map((item) => {
            const Component = item.component;
            return (
              <div className="form-field" key={item.name}>
                <Component
                  error={item.message}
                  {...item}
                  onChange={onChangeHandler}
                />
              </div>
            );
          })}
          {message ? <ErrorMessage message={message} /> : ""}
          <Buttons className="form-btns">
            <Button
              type="button"
              variant="outlined"
              onClick={() => history.goBack()}
            >
              Go back
            </Button>
            <Button type="submit" variant="contained">
              Submit
            </Button>
          </Buttons>
        </Form>
      </Loader>
    </>
  );
};

export default FormComponent;
