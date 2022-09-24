import React from "react";
import styled from "styled-components";
import Dialog from "@material-ui/core/Dialog";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

// THIS IS A REUSABLE MODAL COMPONENT:
// YOU NEED TO CONNECT IT TO THE COMPONENT THAT IS TO TRIGGER IS
// YOU CAN GO THE STORYBOOK TO SEE HOW IT IS USED

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px 0 24px;
`;

const StyledDialog = styled(Dialog)`
  .MuiDialog-container .MuiDialog-paperWidthSm {
    max-width: 800px;
    min-height: 300px;
    margin-top: 10%;

    @media screen and (max-width: 500px) {
      margin-top: 0;
      height: 90vh;
    }
  }
  .MuiDialog-scrollPaper {
    align-items: start;
  }

  @media screen and (max-width: 600px) {
    .MuiDialog-container {
      & .MuiDialog-paperWidthSm {
        border-radius: 0;
      }
      & .MuiDialog-paperScrollPaper {
        max-height: unset;
      }
    }

    .MuiDialog-paper {
      margin: 0;
    }
  }
`;

const DialogTitle = ({
  onClose,
  children,
}: {
  onClose: any;
  children: any;
}) => {
  return (
    <TitleWrapper>
      <h4> {children}</h4>
      {onClose ? (
        <IconButton aria-label="close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </TitleWrapper>
  );
};

type IModalDialog = {
  open: boolean;
  modalContent: any;
  modalTitle?: string;
  showHideButton?: boolean;
  state?: any;
  cb?: Function;
  handleClose: any;
};

const ModalDialog = ({
  modalContent: Content,
  state,
  cb,
  open,
  handleClose,
  showHideButton = false,
  modalTitle,
}: IModalDialog) => {
  return (
    <StyledDialog
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={open}
    >
      {modalTitle || showHideButton ? (
        <DialogTitle onClose={handleClose}>{modalTitle}</DialogTitle>
      ) : (
        ""
      )}
      <Content closeModal={handleClose} state={state} cb={cb} />
    </StyledDialog>
  );
};

export default ModalDialog;
