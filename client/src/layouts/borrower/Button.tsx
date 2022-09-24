import React from "react";
import { useHistory } from "react-router-dom";
import { useUserData } from "../../contexts/user";
import { logout } from "../../api/authorization";
import Loader from "../../components/molecules/Loaders/LoaderWrapper";
import { routes } from "../../routes/Application/routes";
import Button from "../../components/atoms/Buttons/Button";

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
    logout(() => {
      history.push(routes.HOME);
    });
    setUser({ data: {}, isAuthorized: false });
  };

  // if the user IS authorized
  if (!loading && isAuthorized) {
    return (
      <Button type="button" variant="contained" onClick={logoutHandler}>
        Go To Portal
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
            onClick={() => history.push(routes.HOME)}
          >
            Start Application
          </Button>
        );

      default:
        return (
          <Button type="button" variant="contained" onClick={loginHandler}>
            Login
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
