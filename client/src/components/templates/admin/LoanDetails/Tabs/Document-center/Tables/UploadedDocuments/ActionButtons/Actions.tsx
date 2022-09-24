import React from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import DoneIcon from "@mui/icons-material/Done";
import CancelIcon from "@mui/icons-material/CloseOutlined";
import { updateDocumentStatus } from "../../../../../../../../../api/admin-dashboard";
import Modal from "../../../../../../../../organisms/Modal/Regular/ModalAndTriggerButton";
import TriggerButton from "../../../../../../../../atoms/Buttons/TriggerModal/Trigger-button-edit";
import Form from "../DenyForm";

const Wrapper = styled.div``;

const ApproveBtn = styled.button`
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  gap: 10px;
`;

const Status = styled.div`
  &.approved {
    color: var(--color-success);
  }

  &.declined {
    color: var(--color-danger);
  }
`;

interface IProps {
  status: string;
  documentId: string;
  reason: string;
  type: string;
  updateTable: any;
}

const Actions = ({ status, documentId, reason, type, updateTable }: IProps) => {
  const onApproveHandler = async () => {
    const updateDoc: any = await updateDocumentStatus({
      documentId,
      status: "approved",
      reason,
    });
    if (updateDoc?.data?.affected > 0) {
      await updateTable();
      toast.success("Document Approved");
    }
  };

  return (
    <Wrapper>
      {status && status === "pending" && (
        <ButtonsWrapper>
          <ApproveBtn type="button" onClick={onApproveHandler}>
            <DoneIcon sx={{ fontSize: "24px" }} />
          </ApproveBtn>
          <Modal
            button={
              <TriggerButton>
                <CancelIcon sx={{ fontSize: "24px" }} />
              </TriggerButton>
            }
            modalContent={Form}
            state={{
              documentId,
              documentType: type,
            }}
            cb={updateTable}
            modalTitle="Deny document"
          />
        </ButtonsWrapper>
      )}
      {status && status === "approved" && "approved" && (
        <Status className="approved">Approved</Status>
      )}
      {status && status === "denied" && "denied" && (
        <Status className="declined">Denied. {reason}</Status>
      )}
    </Wrapper>
  );
};

export default Actions;
