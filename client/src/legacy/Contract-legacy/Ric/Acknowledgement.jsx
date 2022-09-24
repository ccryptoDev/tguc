import React, { useState } from "react";
import styled from "styled-components";
import signatureimg from "../../../../../../../assets/png/signature.png";
import Button from "../../../components/atoms/Buttons/Button";
import LegalField from "../components/LegalField";
import { Text } from "../../../components/atoms/Typography";

const Wrapper = styled.section`
  .fields-wrapper {
    display: grid;
    grid-template-columns: 3fr 1fr;
    grid-gap: 24px 16px;
    margin: 24px 0;
  }

  @media screen and (max-width: 767px) {
    .fields-wrapper {
      grid-template-columns: 1fr;
    }
  }
`;

const Acknowledgement = ({ addSignature }) => {
  const [signed, setSigned] = useState(false);
  //   const signature = user?.data?.doc?.signature;
  const signature = signatureimg;

  const sign = () => {
    setSigned(true);
    addSignature();
  };

  return (
    <Wrapper>
      <Text className="mb-24">
        NOTICES: The names and addresses of all persons to whom the notices
        required or permitted by law to be sent are set forth above.
      </Text>
      <Text className="mb-24">
        <b>
          Buyer and any co-buyer acknowledge that prior to signing this contract
          each has read and received a legible, completely filled-in copy of
          this contract and that, upon signing, such copy was also signed by the
          parties hereto.
        </b>
      </Text>
      <Text className="mb-24">
        Buyer aid any Co-Buyer acknowledge that (1) before signing this Contract
        each read this Contract and received a legible, completely filled-in
        copy of this Contract, and (2) each has received a copy of every other
        document that each signed during the Contract negotiations.
      </Text>
      <div className="fields-wrapper mb-24">
        <LegalField
          label="Buyer:"
          value={
            signature &&
            signed && (
              <img
                className="signature-img"
                src={signatureimg}
                alt="signature"
              />
            )
          }
        />
        <LegalField label="Date:" value="11/11/2021" />
        <LegalField label="Co-Buyer:" />
        <LegalField label="Date:" value="11/11/2021" />
        <LegalField label="Seller:" />
        <LegalField label="Date:" value="11/11/2021" />
      </div>
      <div className="buttons-wrapper">
        {signature && !signed && (
          <Button type="button" variant="contained" onClick={sign}>
            Accept & Sign
          </Button>
        )}
      </div>
    </Wrapper>
  );
};

export default Acknowledgement;
