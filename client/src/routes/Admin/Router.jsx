import React from "react";
import { Switch, Route } from "react-router-dom";
import { routes } from "./routes.config";
import { renderRoutes } from "./pages.config";
import Login from "../../pages/admin/Login";
import { useUserData, UserProvider } from "../../contexts/admin";
import PrivateRoute from "./PrivateRoute/admin.private-route";
import ForgotPassword from "../../pages/admin/Forgot-password";
import AuthRoute, { AdminRedirectRoute } from "./PrivateRoute/admin.auth-route";
import roles from "./roles";
import NoFound from "./404";

const Routes = () => {
  const {
    user: { isAuthorized, user },
    loading,
  } = useUserData();

  // IF THERE IS NO ROLE FETCHED WE NEED TO RENDER ALL ROUTES TO ALLOW REDIRECTION IF NOT AUTHORIZED
  const role = user?.data?.roleName || roles.ADMIN;

  if (!isAuthorized && !loading) {
    return (
      <Switch>
        <Route component={ForgotPassword} path={routes.FORGOT_PASSWORD} exact />
        <AuthRoute
          exact
          component={Login}
          isAuthorized={isAuthorized}
          path={routes.LOGIN}
        />
        <Route
          path={routes.DASHBOARD}
          isAuthorized={isAuthorized}
          loading={loading}
          component={AdminRedirectRoute}
        />
      </Switch>
    );
  }

  if (isAuthorized) {
    return (
      <Switch>
        {renderRoutes(role).map((props) => {
          return (
            <PrivateRoute
              key={props.key}
              isAuthorized={isAuthorized}
              role={role}
              exact
              {...props}
            />
          );
        })}
        <Route component={NoFound} />
      </Switch>
    );
  }

  return <></>;
};

const AdminRouter = () => {
  return (
    <UserProvider>
      <Routes />
    </UserProvider>
  );
};

export default AdminRouter;
