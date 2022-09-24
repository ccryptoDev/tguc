import React from "react";
import styled from "styled-components";
import { Text, H4 } from "../../../components/atoms/Typography";

const Wrapper = styled.div`
  ol {
    padding-left: 16px;
    margin: 24px 0;

    & li:not(:last-child) {
      margin: 12px 0;
    }
  }
`;

const ElectronicPaymentAuth = () => {
  return (
    <Wrapper>
      <H4 className="mb-24">
        Optional voluntary electronic payment authorization
      </H4>
      <Text className="mb-24">
        <b>
          Notice: this electronic payment authorization is optional - i
          understand that i will still be able to enter into my truth-in-lending
          disclosure and note or retail installment agreement if i do not sign
          this authorization.
        </b>
      </Text>
      <Text className="mb-12">
        <b>
          I hereby exercise my (our) option to make the payments agreed to in my
          Truth in Lending Disclosure and Note or Retail Installment Agreement
          by electronic payment and do voluntarily authorize Modern Asset
          Management, Inc. dba Modern Health Finance, as servicer for Pompeii
          Surgical, Inc its successors or assigns (&quot;Servicer&quot;) to do
          the following:
        </b>
      </Text>
      <ol>
        <li>
          <Text>
            Initiate automatic electronic payments from My Bank Account
            specified below and debit My Bank Account on the Payment Dates
            specified in my Agreement, or for any lesser amount I (we) owe.
          </Text>
        </li>
        <li>
          <Text>
            Re-initiate a payment debit up to two additional times for the same
            amount if the payment is not made for any reason.{" "}
          </Text>
        </li>
        <li>
          <Text>
            If necessary, to credit my account to correct erroneous debits.
          </Text>
        </li>
        <li>
          <Text>
            Initiate a separate electronic payment from My Bank Account below
            for any applicable late payment charge or returned check fee in the
            amounts set forth in my Agreement.
          </Text>
        </li>
        <li>
          <Text>
            I may make any payment at any time by check delivered by mail or
            courier service to 23030 Lake Forest Dr. Suite #202, Laguna Hills,
            CA 92653 , that such payment is to replace my next previously
            authorized Electronic Payment, I acknowledge that Servicer must
            receive it at least three (3) business days beore the previously
            authorized Electronic Payment is scheduled to be made and I will
            notify Servicer in writing, at 23030 Lake Forest Dr. Suite #202,
            Laguna Hills, CA 92653 , that such payment is to replace my next
            previously authorized Electronic Payment. If I want such payment to
            be a payment in addition to the scheduled Authorized Electronic
            Payment, I will notify Servicer accordingly. This Electronic Payment
            Authorization will remain in effect unless I explicitly notify
            Servicer that my Electronic Payment Authorization is withdrawn.
          </Text>
        </li>
      </ol>
      <H4 className="mtb-24">Purpose of authorization</H4>
      <Text className="mtb-24">
        I agree that the electronic payment authorized herein is voluntary and
        for my convenience. This Electronic Payment Authorization is a payment
        mechanism only and does not give Seller or Servicer any collection
        rights greater than those otherwise contained in my Agreement. This
        Authorization does not constitute and is not intended to constitute a
        security interest under state law.
      </Text>
      <H4 className="mtb-24">How to withdraw your authorization</H4>
      <Text>
        I understand that this Electronic Payment Authorization is to remain in
        full force and effect until Servicer has received written notification
        from me that I wish to revoke this authorization. I understand that
        Servicer requires at least three (3) business days prior notice, at
        23030 Lake Forest Dr. Suite #202, Laguna Hills, CA 92653 , in order to
        cancel this Authorization.
      </Text>
    </Wrapper>
  );
};

export default ElectronicPaymentAuth;
