import React, { useState } from "react";
import { toast } from "react-toastify";
import Button from "../../../../atoms/Buttons/Button";
import Buttons from "../../../../molecules/Buttons/ButtonsWrapper";
import Loader from "../../../../molecules/Loaders/LoaderWrapper";
import { fields, passwordFields, initialForm } from "./config";
import { validateForm } from "./validation";
import Form, { PasswordWrapper } from "./Styles";
import ErrorMessage from "../../../../molecules/ErrorMessage/FormError";
import CheckBox from "../../../../molecules/Form/Fields/Checkbox/Default";
import { updateAdminById } from "../../../../../api/admin-dashboard";
import PasswordRule from "../../../../molecules/Form/Elements/PasswordNote";
import { parseFormToFormat } from "../../../../../utils/form/parsers";

type IProps = {
  closeModal: any;
  cb: any;
  state: {
    payload: {
      email?: string;
      userName?: string;
      phoneNumber?: string;
      role: string;
      id?: string;
      isAgent?: boolean;
    };
    request: Function;
  };
};

type ISetPassword = {
  form: any;
  onChange: any;
  show: boolean;
};

const SetPassword = ({ form, onChange, show }: ISetPassword) => {
  return (
    <>
      {passwordFields(form).map((field) => {
        const Component = field.component;
        return (
          <Component
            disabled={!show}
            key={field.name}
            {...field}
            onChange={onChange}
          />
        );
      })}
    </>
  );
};

const AddUpdateUser = ({ closeModal, state, cb }: IProps) => {
  const [form, setForm] = useState(initialForm(state.payload));
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [updatePassword, setUpdatePassword] = useState(false);

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setForm((prevState: any) => {
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

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!updatePassword) form.password.required = false;
    // VALIDATE FORM
    const [isValid, validatedForm] = validateForm(form);
    setLoading(true);
    if (isValid) {
      const payload = parseFormToFormat(validatedForm);

      // CHECK IF EMAIL HAS CHANGED
      if (payload.email === state.payload.email) {
        delete payload.email;
      }
      const practiceManagement = "01d4f47b-ea93-48e9-a306-50dd9bac14f8";
      const result = await updateAdminById({
        id: state?.payload?.id,
        ...payload,
        role: state?.payload?.role,
        practiceManagement,
      });

      if (result && !result.error) {
        await cb();
        closeModal();
        toast.success("the changes have been saved!");
      } else {
        toast.error(result?.error?.message || "something went wrong");
        setErrorMessage("Server Error");
      }
    } else {
      setForm((prevState: any) => {
        return { ...prevState, ...validatedForm };
      });
    }
    setLoading(false);
  };

  const showPasswordHandler = (e: {
    target: { name: string; value: boolean };
  }) => {
    setUpdatePassword(e.target.value);
    // clear the password fields on hide password
    if (
      form.password.value ||
      form.password.message ||
      form.repassword.value ||
      form.repassword.message
    ) {
      setForm((prevState: any) => {
        return {
          ...prevState,
          password: {
            ...prevState.password,
            value: "",
            message: "",
          },
          repassword: {
            ...prevState.repassword,
            value: "",
            message: "",
          },
        };
      });
    }
  };

  return (
    <Loader loading={loading ? 1 : 0}>
      <Form onSubmit={onSubmitHandler} className="content">
        <div className="layout">
          {fields(form).map((field) => {
            const Component = field.component;
            return (
              <Component
                key={field.name}
                {...field}
                onChange={onChangeHandler}
              />
            );
          })}
        </div>
        <PasswordWrapper className="mb-40" show={updatePassword}>
          <div className="checkbox-wrapper">
            <CheckBox
              value={updatePassword}
              label="Change password"
              onChange={showPasswordHandler}
            />
          </div>
          {updatePassword ? <PasswordRule /> : ""}
          <SetPassword
            form={form}
            onChange={onChangeHandler}
            show={updatePassword}
          />
        </PasswordWrapper>

        {errorMessage ? <ErrorMessage message={errorMessage} /> : ""}
        <Buttons>
          <Button onClick={closeModal} variant="outlined" type="button">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Submit
          </Button>
        </Buttons>
      </Form>
    </Loader>
  );
};
export default AddUpdateUser;
