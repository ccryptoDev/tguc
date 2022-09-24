import React, { useState } from "react";
import { toast } from "react-toastify";
import styled from "styled-components";
import Button from "../../../../atoms/Buttons/Button";
import Buttons from "../../../../molecules/Buttons/SubmitForm";
import Loader from "../../../../molecules/Loaders/LoaderWrapper";
import ErrorMessage from "../../../../molecules/ErrorMessage/FormError";
import { getRequester } from "../../../../../api/admin-dashboard/requester";
import { disableAgentApi } from "../../../../../api/admin-dashboard";

const Form = styled.form`
  padding: 0 2rem 2rem;
  .content {
    position: relative;
    display: grid;
    grid-template-columns: 2fr 2fr;
    grid-gap: 2rem;
    margin-bottom: 4rem;

    .errorMessage {
      position: absolute;
      top: 100%;
      padding: 0;
      margin-top: 1rem;
    }
  }
`;

type IProps = {
  closeModal: any;
  state: {
    data: {
      id: string;
    };
  };
  cb: Function;
};

const DisableAgentForm = ({ closeModal, state, cb }: IProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const { id } = state?.data;
    setIsLoading(true);
    if (id) {
      const result: any = await disableAgentApi(id);
      if (result && !result.error) {
        await cb();
        toast.success("The agent was disabled successfully.");
        closeModal();
      } else if (result.error) {
        const message = result?.error?.message || "something went wrong";
        setErrorMessage(message);
      }
    }
    setIsLoading(false);
  };

  return (
    <Loader loading={isLoading}>
      <Form onSubmit={onSubmitHandler} className="content">
        Are you sure you want to disable this agent?
        <br />
        <br />
        {errorMessage ? <ErrorMessage message={errorMessage} /> : ""}
        <Buttons>
          <Button
            onClick={closeModal}
            variant="outlined"
            type="button"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            Disable
          </Button>
        </Buttons>
      </Form>
    </Loader>
  );
};

export default DisableAgentForm;
