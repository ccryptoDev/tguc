import React from "react";
import { Redirect, Route } from "react-router-dom";
import { routes } from "../routes.config";

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
        !isAuthorized ? <Login /> : <Redirect to={routes.DASHBOARD} />
      }
    />
  );
};

export default LoginRoute;
