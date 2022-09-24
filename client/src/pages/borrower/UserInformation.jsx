import React from "react";
import Layout from "../../layouts/borrower";
import { routes } from "../../routes/Borrower/routes";
import PrivateRoute from "../../routes/Borrower/PrivateRoute";
import { useUserData } from "../../contexts/user";
import Main from "../../layouts/borrower/Main";
import Content from "../../components/templates/borrower/UserInformation";

const UserInformation = () => {
  const { user } = useUserData();
  const route = routes.USER_INFORMATION;
  return (
    <Layout>
      <PrivateRoute route={route} id={user?.data?.id}>
        <Main>
          <Content route={route} />
        </Main>
      </PrivateRoute>
    </Layout>
  );
};

export default UserInformation;
