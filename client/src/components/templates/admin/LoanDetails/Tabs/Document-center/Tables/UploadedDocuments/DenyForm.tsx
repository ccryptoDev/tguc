import React, { useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import Select from "../../../../../../../molecules/Form/Fields/Select/Default";
import { updateDocumentStatus } from "../../../../../../../../api/admin-dashboard";
import Button from "../../../../../../../atoms/Buttons/Button";
import Loader from "../../../../../../../molecules/Loaders/LoaderWrapper";

const Wrapper = styled.div``;

const Form = styled.form`
  padding: 2rem 2rem;
  max-width: 600px;
  box-sizing: border-box;

  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ButtonsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 12px;
`;

const options = (docType: string) => [
  { value: "", text: "Select Document Type", id: "1" },
  { value: `Missing ${docType}`, text: `Missing ${docType}`, id: "2" },
  { value: `Unreadable ${docType}`, text: "Unreadable Document", id: "3" },
  { value: `Expired ${docType}`, text: "Expired Document", id: "4" },
  { value: `Incomplete ${docType}`, text: "Incomplete Document", id: "5" },
  { value: "Other", text: "Other Reason", id: "5" },
];

const DenyForm = ({ state, closeModal, cb }: any) => {
  const opts: any[] = options(state?.documentType);
  const [reason, setReason] = useState({ value: opts[0].value, message: "" });
  const [loading, setLoading] = useState(false);

  const onChangeHandler = (e: any) => {
    setReason({ value: e.target.value, message: "" });
  };

  const onDenyHandler = async (e: any) => {
    e.preventDefault();

    if (reason.value) {
      setLoading(true);
      const result: any = await updateDocumentStatus({
        documentId: state?.documentId,
        status: "denied",
        reason: reason.value,
      });
      setLoading(false);
      if (reason && result?.error?.message) {
        setReason((prevState) => ({
          ...prevState,
          message: result?.error?.message,
        }));
      } else {
        await cb();
        if (result?.data?.affected > 0) {
          toast.success(`Document denied. Reason: ${reason.value}`);
        }
        closeModal();
      }
    } else {
      setReason((prevState) => ({ ...prevState, message: "Select a reason" }));
    }
  };

  return (
    <Wrapper>
      <Loader loading={loading}>
        <Form onSubmit={onDenyHandler}>
          <Select
            onChange={onChangeHandler}
            value={reason.value}
            options={opts}
            message={reason.message}
          />
          <ButtonsWrapper>
            <Button variant="outlined" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="contained" type="submit">
              Save
            </Button>
          </ButtonsWrapper>
        </Form>
      </Loader>
    </Wrapper>
  );
};

export default DenyForm;
