/* eslint no-underscore-dangle:0 */
import React, { useState } from "react";
import styled from "styled-components";
import NavBar from "./NavBar";
import { types } from "./config";
import TabContainer from "./RenderTab";
import Loader from "../../../molecules/Loaders/LoaderWrapper";
import ErrorMessage from "../../../molecules/Form/Elements/FormError";

const Wrapper = styled.div`
  padding: 2.5rem;
`;

const Details = ({ loanData, loading, error, fetchLoanData }) => {
  const [activeTab, setActiveTab] = useState(types.USER_INFO);
  const setActiveTabHandler = (type) => {
    setActiveTab(type);
  };

  return (
    <Wrapper>
      <NavBar
        setActiveTabHandler={setActiveTabHandler}
        activeTab={activeTab}
        state={loanData}
      />
      <Loader loading={loading}>
        <ErrorMessage message={error} />
        <TabContainer
          activeTab={activeTab}
          state={loanData}
          fetchLoanData={fetchLoanData}
        />
      </Loader>
    </Wrapper>
  );
};

export default Details;
