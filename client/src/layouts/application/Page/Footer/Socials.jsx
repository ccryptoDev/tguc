import React from "react";
import styled from "styled-components";
import Logo from "../../../../assets/svgs/Logo/Logo-TGUC-financial.svg";
import facebook from "../../../../assets/svgs/Socials/facebook.svg";
import linkedin from "../../../../assets/svgs/Socials/linkedin.svg";
import twitter from "../../../../assets/svgs/Socials/twitter.svg";
import instagram from "../../../../assets/svgs/Socials/instagram.svg";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .logo-wrapper {
    & img {
      height: 24px;
    }
  }
  & ul {
    list-style: none;
    display: flex;
    align-items: center;
    column-gap: 9px;
    & li {
    }
  }
`;

const Socials = () => {
  return (
    <Wrapper>
      <div className="logo-wrapper">
        <img src={Logo} alt="TGUC-financial" />
      </div>
      <ul className="socials-wrapper">
        <li>
          <a href="facebook.com">
            <img src={facebook} alt="facebook" />
          </a>
        </li>
        <li>
          <a href="instagram.com">
            <img src={instagram} alt="instagram" />
          </a>
        </li>
        <li>
          <a href="linkedin.com">
            <img src={linkedin} alt="linkedin" />
          </a>
        </li>
        <li>
          <a href="twitter.com">
            <img src={twitter} alt="twitter" />
          </a>
        </li>
      </ul>
    </Wrapper>
  );
};

export default Socials;
