import React from "react";
import styled from "styled-components";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const Button = styled.button`
  border: none;
  background: transparent;
`;

const Remove = ({ onClick }) => {
  return (
    <Button type="button" onClick={onClick} className="remove-btn">
      <DeleteOutlineIcon sx={{ fontSize: 24, color: "#58595B" }} />
    </Button>
  );
};

export default Remove;
