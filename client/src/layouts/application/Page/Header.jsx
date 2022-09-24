import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Button from "./Button";
import LogoTGUC from "../../../assets/svgs/Logo/Logo-TGUC-financial-light.svg";

const Wrapper = styled.header`
  background: transparent;
  border-bottom: 1px solid var(--color-gray-1);
  height: var(--header-height);
  min-height: var(--header-height);

  .logo img {
    height: 35px;
  }

  .nav {
    padding: 0.5rem 2rem;
    height: 100%;
    max-width: var(--page-width);
    width: 100%;
    margin: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;

    & button {
      box-shadow: none;
    }
  }

  @media screen and (max-width: 767px) {
    .logo img {
      height: 3rem;
    }
  }
  @media screen and (max-width: 500px) {
    .nav {
      flex-direction: column;
    }
  }
`;

const Header = ({ route }) => {
  return (
    <Wrapper>
      <nav className="nav">
        <div className="logo">
          <Link to="/application/">
            <img src={LogoTGUC} alt="TGUC" />
          </Link>
        </div>
        <Button route={route} />
      </nav>
    </Wrapper>
  );
};

export default Header;
