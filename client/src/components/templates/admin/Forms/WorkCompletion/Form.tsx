import React, { useState } from "react";
import { cloneDeep } from "lodash";
import { toast } from "react-toastify";
import Button from "../../../../atoms/Buttons/Button";
import Buttons from "../../../../molecules/Buttons/SubmitForm";
import { useTable } from "../../../../../contexts/Table/table";
import Loader from "../../../../molecules/Loaders/LoaderWrapper";
import { fields, passwordFields, initialForm } from "./config";
import Form, { PasswordWrapper } from "./Styles";
import ErrorMessage from "../../../../molecules/ErrorMessage/FormError";
import CheckBox from "../../../../molecules/Form/Fields/Checkbox/Default";
import { setWorkCompletion } from "../../../../../api/admin-dashboard";

type IProps = {
  closeModal: any;
  state: {
    data: {
      email?: string;
      userName?: string;
      phoneNumber?: string;
      id?: string;
      isAgent?: boolean;
      screenTrackingId?: string;
    };
    request: Function;
  };
};

const WorkCompletion = ({ closeModal, state }: IProps) => {
  const { screenTrackingId }: any = state.data;
  const [form, setForm] = useState(cloneDeep(initialForm(state.data)));
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
    await setWorkCompletion(screenTrackingId, true).then((data) => {
      if (data) {
        toast.success("Work Completion Requested");
        closeModal();
      }
    });
  };

  return (
    <Loader loading={loading ? 1 : 0}>
      <Form onSubmit={onSubmitHandler} className="content">
        {errorMessage ? <ErrorMessage message={errorMessage} /> : ""}
        <Buttons>
          <Button onClick={closeModal} variant="outlined" type="button">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Request
          </Button>
        </Buttons>
      </Form>
    </Loader>
  );
};
export default WorkCompletion;
