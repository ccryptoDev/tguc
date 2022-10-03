import React from "react";
import { buttons } from "./config";
import { NavBarWrapper as Wrapper } from "./Styles";
import { useUserData } from "../../../../contexts/admin";
import { getAdminRoles } from "../../../../helpers";

const NavBar = ({ setActiveTabHandler, activeTab, state }) => {
  const { user } = useUserData();
  const adminRoles = getAdminRoles();
  const role = user?.user?.data?.role?.roleName;
  let tabs = JSON.parse(JSON.stringify(buttons)); // Clone data
  if (state && state?.screenTracking?.isContractor) {
    tabs = tabs.filter((t) => t.name !== "Plaid");
  }
  if (role && role === adminRoles.MerchantStaff) {
    tabs = tabs.filter((t) => {
      return (
        t.name !== "Document Center" &&
        t.name !== "Credit Report" &&
        t.name !== "Rules Details" &&
        t.name !== "Plaid"
      );
    });
  }
  if (role && role === adminRoles.Merchant) {
    tabs = tabs.filter((t) => {
      return (
        t.name !== "Credit Report" &&
        t.name !== "Rules Details" &&
        t.name !== "Plaid"
      );
    });
  }
  const clickHandler = (type) => {
    if (type) {
      setActiveTabHandler(type);
    }
  };
  return (
    <Wrapper>
      {tabs.map(({ name, type, style }) => {
        return (
          <button
            type="button"
            style={style}
            className={type === activeTab ? "active" : ""}
            key={type}
            onClick={() => clickHandler(type)}
          >
            {name}
          </button>
        );
      })}
    </Wrapper>
  );
};

export default NavBar;
