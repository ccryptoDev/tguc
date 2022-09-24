import React from "react";
import SideNav from "./sidenav/SideNav";
import Header from "./header";
import Wrapper from "./styles";
import { sidenav as navItems } from "./sidenav/sidenav.config";
import { useUserData } from "../../contexts/admin";

type Props = {
  route: string | undefined;
  children: any;
};
const MainLayout: React.FC<Props> = ({ children, route = "" }) => {
  const { user } = useUserData();
  const role = user?.user?.data?.roleName;
  const sidenavTabs = navItems(role);

  return (
    <Wrapper className="layout">
      <SideNav active={route} navItems={sidenavTabs} />
      <div className="main-wrapper">
        <Header />
        <main className="main">{children}</main>
      </div>
    </Wrapper>
  );
};
export default MainLayout;
