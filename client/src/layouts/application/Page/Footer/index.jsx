import React from "react";
import FooterWrapper from "./styles";
import CreateAccount from "./Account";
import Terms from "./Terms";
import Socials from "./Socials";

const Footer = () => {
  return (
    <FooterWrapper>
      <div className="nav">
        <CreateAccount />
        <Terms />
        <Socials />
      </div>
      <div className="copyright">Copyright 2022. All Rights Reserved.</div>
    </FooterWrapper>
  );
};

export default Footer;
