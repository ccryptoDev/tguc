import React from "react";
import { useParams } from "react-router-dom";
import DoneIcon from "@mui/icons-material/Done";
import ClearIcon from "@mui/icons-material/Clear";
import styled from "styled-components";
import Modal from "../../../../organisms/Modal/Regular/ModalAndTriggerButton";
import TriggerButton from "../../../../atoms/Buttons/TriggerModal/Trigger-button-edit";
import ApproveForm from "../../Forms/ApproveApplication/Approve";
import DenyApplicationForm from "../../Forms/DenyApplication/Deny";
import { getAdminRoles } from "../../../../../helpers";
import ApproveContractorForm from "../../Forms/ApproveContractorApplication/Approve";
import DenyContractorForm from "../../Forms/DenyContractorApplication/Deny";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  column-gap: 12px;
`;

const Buttons = ({
  cb,
  approveForm,
  denyApplicationForm,
  modalTitleApprove,
  modalTitleDenied,
  state,
}: any) => {
  return (
    <Wrapper>
      <Modal
        button={
          <TriggerButton>
            Approve <DoneIcon sx={{ fontSize: "20px" }} />
          </TriggerButton>
        }
        modalContent={approveForm}
        state={state}
        modalTitle={modalTitleApprove}
        cb={cb}
      />
      <br />
      <Modal
        button={
          <TriggerButton>
            Deny <ClearIcon sx={{ fontSize: "20px" }} />
          </TriggerButton>
        }
        modalContent={denyApplicationForm}
        state={state}
        modalTitle={modalTitleDenied}
        cb={cb}
      />
    </Wrapper>
  );
};

const ActionButtons = ({ loanData, cb, role }: any) => {
  const params: any = useParams();
  const adminRoles = getAdminRoles();
  const isAdmin = role === adminRoles.SuperAdmin;
  const state = {
    email: loanData?.user?.email,
    id: loanData?.screenTracking?.id,
  };

  if (
    isAdmin &&
    !loanData?.screenTracking?.isContractor &&
    loanData?.paymentManagement?.status === "pending"
  ) {
    return (
      <Buttons
        cb={cb}
        approveForm={ApproveForm}
        state={state}
        denyApplicationForm={DenyApplicationForm}
        modalTitleDenied="Application Denial"
        modalTitleApprove="Application Approval"
        id={params.id}
      />
    );
  }

  if (
    isAdmin &&
    loanData?.screenTracking?.isContractor &&
    loanData?.paymentManagement?.status === "pending"
  ) {
    return (
      <Buttons
        cb={cb}
        approveForm={ApproveContractorForm}
        state={state}
        denyApplicationForm={DenyContractorForm}
        modalTitleDenied="Application Denial"
        modalTitleApprove="Application Approval"
        id={params.id}
      />
    );
  }

  return <></>;
};

export default ActionButtons;
