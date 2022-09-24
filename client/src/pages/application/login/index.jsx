import React from "react";
import { Redirect } from "react-router-dom";
import { routes } from "../../../routes/Borrower/routes";

const LoginRedirect = () => {
  return <Redirect to={routes.LOGIN} />;
};

export default LoginRedirect;
