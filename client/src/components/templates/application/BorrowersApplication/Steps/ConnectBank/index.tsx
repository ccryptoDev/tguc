import React, { useState } from "react";
import styled from "styled-components";
import Auto from "./Auto";
import Manual from "./Manual";
import Connected from "./Connected";
import { logoes } from "./logoes";
import Container from "../../styles";

const FormWrapper = styled(Container)`
  .note {
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
    margin-bottom: 12px;
  }

  .img-wrapper {
    margin-right: 40px;
  }
`;

const tabType = {
  AUTO: "AUTO",
  MANUAL: "MANUAL",
};

const Component = ({ isActive }: any) => {
  const [activeTab, setActiveTab] = useState(tabType.AUTO);
  const [connected, setConnected] = useState(false);
  const [selectedBank, setSelectedBank] = useState(logoes[4]);

  const loginToBankHandler = async () => {
    console.log("login to bank");
  };

  const formProps = {
    setActiveTab: (name: string) => setActiveTab(name),
    setConnected,
    setSelectedBank,
    selectedBank,
    tabType,
    loginToBankHandler,
  };

  if (connected) {
    return (
      <FormWrapper>
        <Connected {...formProps} />
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      {activeTab === tabType.AUTO ? (
        <Auto {...formProps} />
      ) : (
        <Manual {...formProps} />
      )}
    </FormWrapper>
  );
};

export default Component;
