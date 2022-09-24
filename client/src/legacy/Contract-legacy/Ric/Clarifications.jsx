import React from "react";
import { Text } from "../../../components/atoms/Typography";

const Clarifications = () => {
  return (
    <div>
      <Text className="mb-12">
        In this Contract the words &quot;we,&quot; &quot;us,&quot; and
        &quot;our&quot; refer to Seller. The words &quot;you&quot; and
        &quot;your&quot; refer to Buyer (and Co-Buyer, if any) named above. By
        signing this Contract, you are buying the &quot;Services&quot; described
        below from the Seller named above, and you agree to the terms set forth
        on the front and back of this Contract.
      </Text>
      <Text className="mb-12">Services: Elective Surgery</Text>
      <Text className="mb-12">
        The price of the Services is shown below as the &quot;Cash Price.&quot;
        By signing this Contract, you choose to buy the Services on credit and
        agree to pay us the total principal amount shown below as the
        &quot;Amount Financed,&quot; which will be (1) the total cash price of
        the Services; plus (2) any costs, fees, or other amounts financed; plus
        (3) interest at the rate of : 16.9% on the unpaid balance until it is
        fully repaid. The interest will be calculated on a simple-interest basis
        based upon a year of 365 days and the actual number of days elapsed. You
        agree to pay us in the amounts and under the terms set forth in this
        Contract. If this Contract is signed by a Buyer and Co-Buyer, each is
        individually and jointly responsible for all agreements in this
        Contract.
      </Text>
    </div>
  );
};

export default Clarifications;
