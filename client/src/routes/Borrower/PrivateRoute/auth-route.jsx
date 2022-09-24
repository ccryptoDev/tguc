import React from "react";
import { Redirect, Route } from "react-router-dom";
import { routes } from "../../Application/routes";

export const AdminRedirectRoute = ({ isAuthorized, loading, ...rest }) => {
  return (
    <Route
      {...rest}
      render={() => !isAuthorized && !loading && <Redirect to={routes.LOGIN} />}
    />
  );
};

const LoginRoute = ({ component: Login, isAuthorized, ...rest }) => {
  return (
    <Route
      {...rest}
      render={() =>
        !isAuthorized ? <Login /> : <Redirect to={routes.BORROWER_PORTAL} />
      }
    />
  );
};

export default LoginRoute;
