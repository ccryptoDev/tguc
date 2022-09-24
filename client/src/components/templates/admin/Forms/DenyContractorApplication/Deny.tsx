import React, { useState } from "react";
import { toast } from "react-toastify";
import Button from "../../../../atoms/Buttons/Button";
import Buttons from "../../../../molecules/Buttons/SubmitForm";
import Loader from "../../../../molecules/Loaders/LoaderWrapper";
import Form from "./Styles";
import ErrorMessage from "../../../../molecules/ErrorMessage/FormError";
import { denyContractorApplication } from "../../../../../api/admin-dashboard";

type IProps = {
  closeModal: any;
  cb: any;
  state: {
    email?: string;
  };
};

const DeclinedApplication = ({ closeModal, state, cb }: IProps) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state.email) {
      setLoading(true);
      const result = await denyContractorApplication(state?.email);
      if (result && !result.error) {
        await cb(); // update UI
        toast.success("The contractor application was denied.");
        closeModal();
      } else {
        toast.error("something went wrong");
        setErrorMessage("something went wrong");
      }
      setLoading(false);
    } else {
      toast.error("no email");
    }
  };

  return (
    <Loader loading={loading ? 1 : 0}>
      <Form onSubmit={onSubmitHandler} className="content">
        <br />
        {errorMessage ? <ErrorMessage message={errorMessage} /> : ""}
        <Buttons>
          <Button onClick={closeModal} variant="outlined" type="button">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Deny
          </Button>
        </Buttons>
      </Form>
    </Loader>
  );
};
export default DeclinedApplication;
