import React from "react";
import Button from "@material-ui/core/Button";
import { Link } from "react-router-dom";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import MenuList from "@material-ui/core/MenuList";
import { Wrapper, ListItem, DropDown } from "../Styles";
import Avatar from "../../../../atoms/Icons/SvgIcons/SideNav/person";
import Mail from "../../../../atoms/Icons/SvgIcons/Mail";
import { useUserData } from "../../../../../contexts/admin";
import { routes } from "../../../../../routes/Admin/routes.config";
import phoneImg from "../../../../../assets/svgs/text-message.svg";

type Props = {
  user: {
    img: string;
  };
};

const MenuListComposition = ({ user }: Props) => {
  const { fetchUser } = useUserData();
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);

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
  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      // eslint-disable-next-line
      anchorRef.current!.focus();
    }

    prevOpen.current = open;
  }, [open]);

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
          {user.img && user.img.length > 3 ? (
            <img src={user?.img} alt="user" />
          ) : (
            <Avatar size="3rem" />
          )}
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
                        <Link to={routes.INVITE_EMAIL}>
                          <Mail />
                          <span>Send Email</span>
                        </Link>
                      </div>
                    </ListItem>
                    <ListItem onClick={handleClose}>
                      <div className="item-wrapper">
                        <Link to={routes.INVITE_TEXT}>
                          <img src={phoneImg} alt="phone" />
                          <span>Send Text</span>
                        </Link>
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
