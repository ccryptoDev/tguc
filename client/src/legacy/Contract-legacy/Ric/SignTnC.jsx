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

  .singTnC-footer {
    display: flex;
    column-gap: 16px;
    margin-top: 24px;
  }

  @media screen and (max-width: 767px) {
    .fields-wrapper {
      grid-template-columns: 1fr;
    }
  }
`;

const SignTnC = ({ user, type, addSignature }) => {
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
        <b>
          By signing below, borrower agrees to the terms and conditions of this
          electronic funds transfer agreement.
        </b>
      </Text>
      <div className="fields-wrapper mb-24">
        <LegalField
          label="Borrower's Signature:"
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
      </div>
      <div className="buttons-wrapper">
        {signature && !signed && (
          <Button type="button" variant="contained" onClick={sign}>
            Accept & Sign
          </Button>
        )}
      </div>
      <div className="singTnC-footer">
        <Text>11/11/2021</Text>
        <Text>IP:109.197.220.146</Text>
      </div>
    </Wrapper>
  );
};

export default SignTnC;
