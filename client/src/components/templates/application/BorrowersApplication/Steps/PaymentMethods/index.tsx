import React, { useState } from "react";
import Container from "../../styles";
import { H3 } from "../../../../../atoms/Typography";
import TabsWrapper from "../../../../../molecules/Tabs/Material-ui/styles";
import Tabs from "../../../../../molecules/Tabs/Material-ui";
import Wrapper from "./styles";
import AutoPay from "./Forms/AutoPay";
import Invoice from "./Forms/Invoice";

export const tabNames = {
  AUTOPAY: "AUTOPAY",
  INVOICE: "INVOICE",
};

export const tabs = [
  { button: "AutoPay", value: tabNames.AUTOPAY },
  { button: "Invoice", value: tabNames.INVOICE },
];

const PaymentMethod = ({ moveToNextStep }: { moveToNextStep: any }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].value);

  return (
    <Container>
      <Wrapper>
        <H3 className="heading">Payment Method</H3>
        <TabsWrapper className="tabs-wrapper">
          <Tabs buttons={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </TabsWrapper>
        {activeTab === tabNames.AUTOPAY ? (
          <AutoPay />
        ) : (
          <Invoice moveToNextStep={moveToNextStep} />
        )}
      </Wrapper>
    </Container>
  );
};

export default PaymentMethod;
