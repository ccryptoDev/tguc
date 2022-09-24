import React, { useState } from "react";
import { toast } from "react-toastify";
import Button from "../../../../atoms/Buttons/Button";
import Buttons from "../../../../molecules/Buttons/SubmitForm";
import Loader from "../../../../molecules/Loaders/LoaderWrapper";
import Form from "./Styles";
import ErrorMessage from "../../../../molecules/ErrorMessage/FormError";
import { updateContractorApplicationStatus } from "../../../../../api/admin-dashboard";

type IProps = {
  closeModal: any;
  cb?: any;
  state: {
    email: string;
  };
};

type ISetPassword = {
  form: any;
  onChange: any;
  show: boolean;
};

const AddUpdateUser = ({ closeModal, state, cb }: IProps) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // parse form back to the api object format
    const result = await updateContractorApplicationStatus(
      state?.email,
      "qualified"
    );

    if (result && !result.error) {
      await cb(); // update UI
      toast.success("The contractor application was marked as qualified.");
      closeModal();
    } else {
      toast.error("something went wrong");
      setErrorMessage("something went wrong");
    }

    setLoading(false);
  };

  return (
    <Loader loading={loading ? 1 : 0}>
      <Form onSubmit={onSubmitHandler} className="content">
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
export default AddUpdateUser;
