import React, { useState } from "react";
import { toast } from "react-toastify";
import Button from "../../../../atoms/Buttons/Button";
import Buttons from "../../../../molecules/Buttons/ButtonsWrapper";
import Loader from "../../../../molecules/Loaders/LoaderWrapper";
import { fields, initialForm } from "./config";
import Form from "./Styles";
import ErrorMessage from "../../../../molecules/ErrorMessage/FormError";

type IProps = {
  closeModal: any;
  state: {
    data: {
      email?: string;
      userName?: string;
      phoneNumber?: string;
      id?: string;
      isAgent?: boolean;
    };
    request: Function;
  };
};

const AddUpdateUser = ({ closeModal, state }: IProps) => {
  const [form, setForm] = useState(initialForm(state.data));
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
    toast.success("Your bid has been submitted!");
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

        {errorMessage ? <ErrorMessage message={errorMessage} /> : ""}
        <Buttons>
          <Button onClick={closeModal} variant="outlined" type="button">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Bid
          </Button>
        </Buttons>
      </Form>
    </Loader>
  );
};
export default AddUpdateUser;
