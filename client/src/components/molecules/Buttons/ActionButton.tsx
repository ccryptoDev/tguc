import React from "react";
import styled from "styled-components";
import EditIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import Chevron from "@mui/icons-material/ArrowBackIosNewOutlined";
import SaveIcon from "@mui/icons-material/SaveOutlined";
import CancelIcon from "@mui/icons-material/ClearOutlined";
import Logout from "@mui/icons-material/LogoutOutlined";
import BellIcon from "@mui/icons-material/NotificationsActiveOutlined";
import BurgerMenu from "@mui/icons-material/MenuOutlined";
import Settings from "@mui/icons-material/SettingsOutlined";
import Delete from "@mui/icons-material/DeleteOutlineOutlined";
import DoneIcon from "@mui/icons-material/Done";
import ClearIcon from "@mui/icons-material/Clear";
import Loader from "../Loaders/Loader";

const Button = styled.button`
  position: relative;
  padding: 0.8rem;
  border-radius: 0.8rem;
  border: 1px solid var(--color-border);
  background: #fff;
  width: 4.2rem;
  height: 4.2rem;
  display: flex;
  align-items: center;
  justify-content: center;

  & .chevron-icon {
    transform: rotate(-90deg);
    font-weight: 700;
  }

  .preloader {
    margin-top: 3px;
  }
`;

const ActionButton = ({
  onClick,
  type,
  loading,
}: {
  onClick?: any;
  loading?: boolean;
  type:
    | "goback"
    | "edit"
    | "cancel"
    | "save"
    | "logout"
    | "notifications"
    | "settings"
    | "menu"
    | "delete"
    | "approve"
    | "decline";
}) => {
  const config = { fontSize: "24px" };
  const renderIcon = () => {
    if (type === "edit") {
      return <EditIcon sx={config} />;
    }
    if (type === "goback") {
      return <Chevron sx={config} />;
    }
    if (type === "save") {
      return loading ? (
        <Loader size="4" position="center" />
      ) : (
        <SaveIcon sx={config} />
      );
    }

    if (type === "cancel") {
      return <CancelIcon sx={config} />;
    }
    if (type === "logout") {
      return <Logout sx={config} />;
    }
    if (type === "notifications") {
      return <BellIcon sx={config} />;
    }
    if (type === "settings") {
      return <Settings sx={config} />;
    }
    if (type === "approve") {
      return <DoneIcon sx={config} />;
    }
    if (type === "decline") {
      return <ClearIcon sx={config} />;
    }
    if (type === "menu") {
      return <BurgerMenu sx={config} />;
    }
    if (type === "delete") {
      return loading ? (
        <Loader size="4" position="center" />
      ) : (
        <Delete sx={config} />
      );
    }
    return <></>;
  };
  return (
    <Button type="button" onClick={onClick} className="action-button">
      {renderIcon()}
    </Button>
  );
};

export default ActionButton;
