import React from "react";
import { useHistory } from "react-router-dom";
import { useUserData } from "../../../contexts/user";
import { routes } from "../routes";
import { stepNames } from "../../../components/templates/application/BorrowersApplication/Steps/config";
import { routes as applicationRoute } from "../../Application/routes";

const privateRoutes = [
  routes.DOCUMENT_CENTER,
  routes.LOAN_INFORMATION,
  routes.USER_INFORMATION,
  routes.WORK_COMPLETION,
];

type IProps = {
  children: any;
  route: string;
};

const PrivateRoute = ({ children, route }: IProps) => {
  const { user, loading } = useUserData();
  const history = useHistory();

  // IF APPLICATION IS INCOMPLETE SEND THE USER TO BACK TO APPLICATION
  if (
    user?.isAuthorized &&
    user?.data?.screenTracking?.lastScreen !== stepNames.APPLICATION_COMPLETED
  ) {
    history.push(applicationRoute.APPLY_BORROWER);
    return <></>;
  }
  // redirect unauthorized user from a private page to log in page
  if (!user?.isAuthorized && !loading && privateRoutes.indexOf(route) !== -1) {
    history.push(routes.LOGIN);
    return <></>;
  }

  if (user?.isAuthorized && !loading && privateRoutes.indexOf(route) === -1) {
    history.push(routes.USER_INFORMATION);
    return <></>;
  }
  // otherwise load the route that matches the current url
  return children;
};

export default PrivateRoute;
