import React from "react";
import { Link } from "react-router-dom";
import { routes } from "../../../../routes/Application/routes";
import { ListWrapper } from "./styles";

const CreatAccount = () => {
  return (
    <ListWrapper className="section-application">
      <li>
        <Link to={routes.LOGIN} className="link-button">
          Sign In
        </Link>
      </li>
      <li>
        <Link to={routes.HOME} className="link-button">
          Start Application
        </Link>
      </li>
      <li>
        <a
          href="https://www.tguc-financial.com/contact"
          target="_blank"
          rel="noreferrer"
          className="link-button"
        >
          Contact us
        </a>
      </li>
    </ListWrapper>
  );
};

export default CreatAccount;
