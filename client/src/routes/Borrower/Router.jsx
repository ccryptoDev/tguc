import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { routes as route } from "./routes";
import UserInformation from "../../pages/borrower/UserInformation";
import DocumentCenter from "../../pages/borrower/DocumentCenter";
import LoanInformation from "../../pages/borrower/LoanInformation";
import WorkCompletion from "../../pages/borrower/WorkCompletion";
import { UserProvider, useUserData } from "../../contexts/user";
import NotFound from "../../pages/borrower/NotFound";
import Login from "../../pages/borrower/authorization/login";
import AuthRoute from "./PrivateRoute/auth-route";
import ForgotPassword from "../../pages/borrower/authorization/forgotPassword";

const Routes = () => {
  const {
    loading,
    user: { isAuthorized },
  } = useUserData();

  if (!isAuthorized && !loading) {
    return (
      <Switch>
        <AuthRoute
          exact
          component={Login}
          isAuthorized={isAuthorized}
          path={route.LOGIN}
        />
        <Route path={route.FORGOT_PASSWORD} exact component={ForgotPassword} />
        <Redirect to={route.LOGIN} />
      </Switch>
    );
  }

  if (isAuthorized) {
    return (
      <Switch>
        <Route
          path={route.USER_INFORMATION}
          exact
          component={UserInformation}
        />
        <Route path={route.DOCUMENT_CENTER} exact component={DocumentCenter} />
        <Route
          path={route.LOAN_INFORMATION}
          exact
          component={LoanInformation}
        />
        <Route path={route.WORK_COMPLETION} exact component={WorkCompletion} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return <></>;
};

const BorrowerRouter = () => {
  return (
    <UserProvider>
      <Routes />
    </UserProvider>
  );
};

export default BorrowerRouter;
