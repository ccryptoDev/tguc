import React from "react";
import {
  PageWrapper,
  UIWrapper,
} from "../../components/templates/admin/Login/PageStyles";
import logo from "../../assets/svgs/Logo/Logo.svg";
import background from "../../assets/svgs/financial-data-bro.svg";

const LoginLayout = ({
  heading,
  children,
}: {
  heading: string;
  children: any;
}) => {
  return (
    <PageWrapper style={{ background: `url(${background})` }}>
      <UIWrapper>
        <img src={logo} alt="" />
        <div className="card">
          <div className="sign">
            <h4>Welcome</h4>
          </div>
          <div className="heading">
            <p>{heading}</p>
          </div>
          {children}
        </div>
      </UIWrapper>
    </PageWrapper>
  );
};

export default LoginLayout;
