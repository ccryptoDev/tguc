import React, { useState } from "react";
import { cloneDeep } from "lodash";
import { toast } from "react-toastify";
import Button from "../../../../atoms/Buttons/Button";
import Buttons from "../../../../molecules/Buttons/SubmitForm";
import { useTable } from "../../../../../contexts/Table/table";
import Loader from "../../../../molecules/Loaders/LoaderWrapper";
import { fields, passwordFields, initialForm } from "./config";
import Form from "./Styles";
import ErrorMessage from "../../../../molecules/ErrorMessage/FormError";
import { getRequester } from "../../../../../api/admin-dashboard/requester";
import baseUrl from "../../../../../app.config";
import { approveBorrowerApplication } from "../../../../../api/admin-dashboard";

type IProps = {
  closeModal: any;
  state: {
    id?: string;
  };
  cb: Function;
};

const ApproveForm = ({ closeModal, state, cb }: IProps) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const { id } = state;
    if (id) {
      const result: any = await approveBorrowerApplication(id);
      if (result && !result?.error) {
        toast.success("The application was approved.");
        await cb(); // update UI
        closeModal();
      } else if (result.error) {
        const message = result?.error?.message || "something went wrong";
        setErrorMessage(message);
      }
    }
    setLoading(false);
  };

  return (
    <Loader loading={loading ? 1 : 0}>
      <Form onSubmit={onSubmitHandler} className="content">
        <br />
        <br />
        <br />
        {errorMessage ? <ErrorMessage message={errorMessage} /> : ""}
        <Buttons>
          <Button onClick={closeModal} variant="outlined" type="button">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Approve
          </Button>
        </Buttons>
      </Form>
    </Loader>
  );
};
export default ApproveForm;
