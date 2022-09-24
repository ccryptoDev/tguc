import React from "react";
import { Text, H3 } from "../../../../../atoms/Typography";

function Header() {
  return (
    <div>
      <div className="heading-wrapper mb-20">
        <H3>Contract</H3>
      </div>
      <Text className="mtb-24">
        4362 Blue Diamond Rd #102-348 Las Vegas, NV 89139
      </Text>
      <Text className="mb-12">Thank you for choosing TGUC Financial.</Text>
      <Text className="mb-24">
        Congratulations on taking this life changing step. This is the
        Installment Sales Agreement for your upcoming procedure with Pompeii
        Surgical. Please read the contract and the information below as there
        are important deadlines that must be met. Delays could cause TGUC
        Financial to not be able to offer financing.
      </Text>
    </div>
  );
}

export default Header;
