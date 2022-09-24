import React from "react";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import styled from "styled-components";
import Camera from "../../../../../../../../../organisms/Camera";
import Modal from "../../../../../../../../../organisms/Modal/Regular/ModalAndTriggerButton";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  column-gap: 10px;
  .modal-wrapper {
    display: flex;
    justify-content: center;
  }

  .image-loaded {
    display: flex;
    column-gap: 10px;
    align-items: center;
  }
`;

const TakePictureBtn = ({ setCameraImage }) => {
  return (
    <Wrapper>
      <div className="modal-wrapper">
        <Modal
          button={<AddAPhotoIcon sx={{ fontSize: 24, color: "#58595B" }} />}
          modalContent={Camera}
          state={{ saveImage: setCameraImage }}
        />
      </div>
    </Wrapper>
  );
};

export default TakePictureBtn;
