import React from "react";
import { TabContentWrapper as Wrapper } from "./Styles";
import { types } from "./config";
import CreditReport from "./Tabs/Credit-report/Credit-report";
import DocumentCenter from "./Tabs/Document-center/Document-center";
import RulesDetails from "./Tabs/Rules-details";
import UserInfo from "./Tabs/UserInfo/UserInfo";
import Comments from "./Tabs/Comments";
import Plaid from "./Tabs/Plaid";

const renderComponent = ({ activeTab, state, fetchLoanData }) => {
  const props = { state, fetchLoanData };
  switch (activeTab) {
    case types.CREDIT_REPORT:
      return <CreditReport {...props} />;
    case types.DOCUMENT_CENTER:
      return <DocumentCenter {...props} />;
    case types.COMMENTS:
      return <Comments {...props} />;
    case types.REULES_DETAILS:
      return <RulesDetails {...props} />;
    case types.USER_INFO:
      return <UserInfo {...props} />;
    case types.PLAID:
      return <Plaid {...props} />;
    default:
      return <></>;
  }
};

const RenderTab = ({ activeTab, state, fetchLoanData, docsData }) => {
  return (
    <Wrapper>
      {renderComponent({ activeTab, state, fetchLoanData, docsData })}
    </Wrapper>
  );
};

export default RenderTab;
