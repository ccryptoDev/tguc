import React from "react";
import { buttons } from "./config";
import { NavBarWrapper as Wrapper } from "./Styles";

const NavBar = ({ setActiveTabHandler, activeTab, state }) => {
  let tabs = JSON.parse(JSON.stringify(buttons)); // Clone data
  if (state && state?.screenTracking?.isContractor) {
    tabs = tabs.filter((t) => t.name !== "Plaid");
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
