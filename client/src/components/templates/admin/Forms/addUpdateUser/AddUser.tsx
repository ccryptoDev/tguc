import React, { useState } from "react";
import { toast } from "react-toastify";
import Button from "../../../../atoms/Buttons/Button";
import Buttons from "../../../../molecules/Buttons/ButtonsWrapper";
import Loader from "../../../../molecules/Loaders/LoaderWrapper";
import { fields, initialForm, passwordFields } from "./config";
import { validateForm } from "./validation";
import ErrorMessage from "../../../../molecules/ErrorMessage/FormError";
import { addAdmin } from "../../../../../api/admin-dashboard";
import Form from "./Styles";
import PasswordRule from "../../../../molecules/Form/Elements/PasswordNote";
import { parseFormToFormat } from "../../../../../utils/form/parsers";

type IProps = {
  closeModal: any;
  cb?: any;
  state: {
    payload: {
      email?: string;
      userName?: string;
      phoneNumber?: string;
      id?: string;
      isAgent?: boolean;
      role: string;
    };
    request: Function;
  };
};

const AddUpdateUser = ({ closeModal, state, cb }: IProps) => {
  const [form, setForm] = useState(initialForm(state.payload));
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

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

    // validate form
    const [isValid, validatedForm] = validateForm(form);

    setLoading(true);
    if (isValid) {
      // parse form back to the api object format
      const payload = parseFormToFormat(validatedForm);
      const practiceManagement = "01d4f47b-ea93-48e9-a306-50dd9bac14f8";
      const result = await addAdmin({
        ...state?.payload,
        ...payload,
        practiceManagement,
      });
      if (result && !result.error) {
        toast.success("the changes have been saved!");
        await cb();
        closeModal();
      } else {
        toast.error(result?.error?.message || "something went wrong");
        setErrorMessage(result?.error?.message);
      }
    } else {
      setForm((prevState: any) => {
        return { ...prevState, ...validatedForm };
      });
    }
    setLoading(false);
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
          {passwordFields(form).map((field) => {
            const Component = field.component;
            return (
              <Component
                key={field.name}
                {...field}
                onChange={onChangeHandler}
              />
            );
          })}
          <PasswordRule className="textField" />
          <ErrorMessage message={errorMessage} />
        </div>
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
