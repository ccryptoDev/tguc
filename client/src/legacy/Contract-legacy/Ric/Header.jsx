import React from "react";
import { Text, H4 } from "../../../components/atoms/Typography";

const Header = () => {
  return (
    <div>
      <H4 className="mb-24">The retail installment sales contract</H4>
      <Text className="mb-12">
        TGUC Financial requires that this contract should be signed right away,
        The contract will be dated to start on the day of your procedure, when
        scheduled. Typically, your first payment will be due 30-days after your
        procedure. Since most people need time to recover, you may miss some
        time at work. Please make sure you have reserved enough money for your
        first payment.
      </Text>
      <Text className="mb-12">
        There are attachments to the contract allowing us to contact you
        electronically and collect your payment directly from your bank, as well
        as an arbitration agreement in the event of a dispute.
      </Text>
      <Text className="mb-12">
        All payments are collected through ACH (electronic check) or debit card.
        There is a page for you to provide your banking information. Payments
        are automatically deducted on the day you chose when you submitted your
        application. Tell us now if you need to change the payment date shown in
        the contract on the next page.
      </Text>
      <Text className="mb-12">
        Your ACH or e-check payment will read &ldquo Private Payment
        Services&ldquo or &ldquo PrivatePmtSvcing &ldquo depending on your bank.
      </Text>
      <Text className="mb-12">
        Please Note: “Once your contract is effective, email notices regarding
        your new account & payment reminders will come from
        portal1@FA-servicing.com. Please note this email address as it may go
        directly into your junk or spam folders. Account access will also become
        available online at https://myaccount.1stassociates.com/Register.aspx”.
      </Text>
      <H4 className="mtb-24">Down payment</H4>
      <Text>
        We assume that any Down Payment due to your provider, you are paying
        directly to Pompeii Surgical unless arrangements are otherwise made.
        Please ensure these arrangements are fully understood or contact your
        provider for more information.
      </Text>
      <H4 className="mtb-24">Contact us</H4>
      <Text>
        Our telephone number for questions is 619-403-9753 option 1. Hours of
        operation are 8:30am-6:00pm PST, Monday through Friday.
      </Text>
    </div>
  );
};

export default Header;
