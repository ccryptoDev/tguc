import React from "react";
import { useHistory } from "react-router-dom";
import { useUserData } from "../../../contexts/user";
import Loader from "../../../components/molecules/Loaders/LoaderWrapper";
import { routes } from "../../../routes/Borrower/routes";
import Button from "../../../components/atoms/Buttons/Button";
import { logout } from "../../../api/authorization";
import { routes as applicationRoute } from "../../../routes/Application/routes";

const RenderButton = ({ route }: { route: string }) => {
  const history = useHistory();
  const {
    loading,
    user: { isAuthorized },
    setUser,
  } = useUserData();

  const loginHandler = () => {
    history.push(routes.LOGIN);
  };

  const logoutHandler = () => {
    history.push(applicationRoute.HOME);
    setUser({ isAuthorized: false, data: null });
  };

  // if the user IS authorized
  if (!loading && isAuthorized) {
    return (
      <Button
        type="button"
        variant="contained"
        onClick={() => logout(logoutHandler)}
      >
        Log out
      </Button>
    );
  }

  // if the user IS NOT authorized
  if (!loading && !isAuthorized) {
    switch (route) {
      case routes.LOGIN:
      case routes.FORGOT_PASSWORD:
        return (
          <Button
            type="button"
            variant="contained"
            onClick={() => history.push(routes.USER_INFORMATION)}
          >
            Start Application
          </Button>
        );

      default:
        return (
          <Button type="button" variant="contained" onClick={loginHandler}>
            Log in
          </Button>
        );
    }
  }

  // checking auth
  return (
    <div>
      <Loader loading size="4">
        <div />
      </Loader>
    </div>
  );
};

export default RenderButton;
