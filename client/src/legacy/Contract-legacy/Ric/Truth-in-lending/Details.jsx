import React from "react";
import styled from "styled-components";
import { H4, Text } from "../../../../components/atoms/Typography";

const Wrapper = styled.div`
  padding-top: 24px;
  .info-row {
    &:not(:last-child) {
      margin-bottom: 24px;
    }
  }
`;

const TinLDetails = () => {
  return (
    <Wrapper>
      <div className="info-row">
        <Text>
          <b>Payment Schedule:</b>
        </Text>
        <Text>10 monthly payments of $431.63 beginning on 09/01/2021.</Text>
      </div>
      <div className="info-row">
        <Text>
          <b>Late Charges:</b>{" "}
        </Text>
        <Text>
          If any payment is more than 10 days late, you will be charged a late
          charge of $15.00.
        </Text>
      </div>

      <div className="info-row">
        <Text>
          <b>Prepayment: </b>
        </Text>
        <Text>If you pay early, you will not have to pay a penalty.</Text>
      </div>

      <div className="info-row">
        <Text>
          <b>Non-refundable Application Fee: </b>
        </Text>
        <Text>$0.00 must be paid at time of application.</Text>
      </div>

      <div>
        <Text>
          Read the Contract for any additional information about nonpayment,
          default, any required prepayment in full before the scheduled date.
        </Text>
      </div>
    </Wrapper>
  );
};

export default TinLDetails;
