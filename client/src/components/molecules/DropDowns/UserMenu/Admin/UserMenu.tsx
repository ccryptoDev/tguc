import React, { useEffect, useRef, useState } from "react";
import Button from "@material-ui/core/Button";
import { Link } from "react-router-dom";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import ListItemText from "@material-ui/core/ListItemText";
import MenuList from "@material-ui/core/MenuList";
import { Wrapper, ListItem, DropDown } from "../Styles";
import Avatar from "../../../../atoms/Icons/SvgIcons/Avatar";
import Logout from "../../../../atoms/Icons/SvgIcons/Logout";
import Lock from "../../../../atoms/Icons/SvgIcons/Lock";
import { logout } from "../../../../../api/admin-dashboard/login";
import { routes } from "../../../../../routes/Admin/routes.config";
import { useUserData } from "../../../../../contexts/admin";
import { Chevron } from "../../../../atoms/Icons/SvgIcons/Chevron";

type Props = {
  user: {
    img: string;
    name: string;
    role: string;
  };
};

const MenuListComposition = ({ user }: Props) => {
  const { fetchUser } = useUserData();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: React.MouseEvent<EventTarget>) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  const handleListKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    }
  };

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      // eslint-disable-next-line
      anchorRef.current!.focus();
    }

    prevOpen.current = open;
  }, [open]);

  const logoutHandler = () => {
    logout();
    fetchUser();
  };

  return (
    <Wrapper>
      <div>
        <Button
          ref={anchorRef}
          aria-controls={open ? "menu-list-grow" : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
          className="avatar"
        >
          {user.img && /\.png$/.test(user.img) ? (
            <img src={user?.img} alt="user" />
          ) : (
            <Avatar size="30px" />
          )}
          <div className="name-wrapper">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <Chevron />
        </Button>
        <DropDown
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === "bottom" ? "center top" : "center bottom",
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList
                    autoFocusItem={open}
                    id="menu-list-grow"
                    onKeyDown={handleListKeyDown}
                  >
                    <ListItem onClick={handleClose}>
                      <div className="item-wrapper">
                        <Link to={routes.RESET_PASSWORD}>
                          <Lock />
                          <span>Change Password</span>
                        </Link>
                      </div>
                    </ListItem>
                    <ListItem onClick={handleClose}>
                      <div className="item-wrapper">
                        <button type="button" onClick={logoutHandler}>
                          <Logout />
                          <ListItemText primary="Logout" />
                        </button>
                      </div>
                    </ListItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </DropDown>
      </div>
    </Wrapper>
  );
};

export default MenuListComposition;
