import React from "react";
import { Redirect, Route } from "react-router-dom";
import { routes } from "../routes.config";

const Portal = ({ userRole, props, component: Component }) => {
  // checking if the component has userRole
  switch (userRole) {
    case "Super Admin":
    case "Merchant Staff":
    case "Merchant":
      return <Component {...props} />;
    default:
      return <Redirect to={routes.LOGIN} />;
  }
};

const PrivateRoute = ({ component, isAuthorized, role, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthorized ? (
          <Portal userRole={role} component={component} props={props} />
        ) : (
          <Redirect to={routes.LOGIN} />
        )
      }
    />
  );
};

export default PrivateRoute;
