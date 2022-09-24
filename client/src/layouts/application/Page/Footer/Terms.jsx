import React from "react";
import { Link } from "react-router-dom";
import { ListWrapper } from "./styles";
import { routes } from "../../../../routes/Application/routes";

const Terms = () => {
  return (
    <ListWrapper className="section-contacts">
      <li>
        <Link to={routes.PRIVACY_POLICY} className="link-button">
          Privacy Policy
        </Link>
      </li>
      <li>
        <Link to={routes.PRIVACY_NOTE} className="link-button">
          Privacy Notice
        </Link>
      </li>
      <li>
        <Link to={routes.ECONSENT} className="link-button">
          E-Consent
        </Link>
      </li>
    </ListWrapper>
  );
};

export default Terms;
