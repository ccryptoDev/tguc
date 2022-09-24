import React from "react";
import styled from "styled-components";
import Tabs from "../Components/Tabs";
import Form from "./Form";

const Wrapper = styled.div``;

const UserInformation = ({ route }: { route: string }) => {
  return (
    <Wrapper>
      <Tabs activeRoute={route} tabName="User Information" />
      <Form />
    </Wrapper>
  );
};

export default UserInformation;
