import React from "react";
import UserMenu from "../../../components/molecules/DropDowns/UserMenu/Admin/UserMenu";
import AddUser from "../../../components/molecules/DropDowns/UserMenu/Admin/AddUser";
import Wrapper from "./styles";
import MenuButton from "../../../components/atoms/Buttons/BurgerMenu";
import { useUserData } from "../../../contexts/admin";

const Header = () => {
  const { user } = useUserData();

  const toggleMenuHandler = () => {
    // toggle the side nav
    const layout = document.querySelector(".layout");
    if (layout && layout.classList.contains("expand")) {
      layout.classList.remove("expand");
    } else if (layout) {
      layout.classList.add("expand");
    }
  };
  return (
    <Wrapper className="layout-main-header">
      <MenuButton onClick={toggleMenuHandler} />
      <div className="navigation-menu">
        <div className="plus">Invite Borrower</div>
        <AddUser user={{ img: "" }} />
      </div>
      <div className="navigation-menu">
        <UserMenu
          user={{
            img: "",
            name: user?.user?.data?.userName,
            role: user?.user?.data?.roleName,
          }}
        />
      </div>
    </Wrapper>
  );
};

export default Header;
