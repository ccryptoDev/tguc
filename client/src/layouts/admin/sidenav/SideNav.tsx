import React from "react";
import styled from "styled-components";
import Wrapper from "./Styles";
import NavItem from "./NavItem";
import logo from "../../../assets/svgs/Logo/Logo-TGUC-financial.svg";
import lowesIcon from "../../../assets/svgs/Logo/lowes.png";

type Props = {
  active: string; //name of the active route
  navItems: { route: string; title: string; icon: any }[];
};

const StyleLowes = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  padding: 0 16px;
  width: 300px;
  img {
    height: 40px;
  }
  a {
    font-size: 12px;
    color: #363636;
    color: var(--color-blue-1);
  }
`;
const SideNav: React.FC<Props> = ({ active, navItems }) => {
  return (
    <Wrapper className="layout-sidenav">
      <div className="logo">
        <img src={logo} alt="TGUC-financial" className="logo-big" />
      </div>
      <ul className="sidenav-menu">
        {navItems.map((item) => (
          <NavItem active={active} key={item.title} item={item} />
        ))}
      </ul>
      <StyleLowes className="hxpt">
        <div>
          <img src={lowesIcon} alt="TGUC-financial" className="logo-big" />
        </div>
        <div>
          <a
            href="https://www.lowes.com/l/Pro/pro-benefits"
            target="_blank"
            rel="noreferrer"
          >
            Get Your Lowes Discount Now
          </a>
        </div>
      </StyleLowes>
    </Wrapper>
  );
};

export default SideNav;
