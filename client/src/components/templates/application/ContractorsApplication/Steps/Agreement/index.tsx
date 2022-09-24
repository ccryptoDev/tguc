import React, { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import styled from "styled-components";
import Content from "./Content";
import Button from "../../../../../atoms/Buttons/Button";
import Checkbox from "../../../../../molecules/Form/Fields/Checkbox/Custom";
import { useStepper } from "../../../../../../contexts/steps";
import Header from "../../../Components/FormHeader";
import { approveContractorApplication } from "../../../../../../api/admin-dashboard";
import { useUserData } from "../../../../../../contexts/user";

const Wrapper = styled.div`
  .checbox-wrapper {
    margin: 2rem 0;
  }
  .buttons-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;

const DealerAgreement = () => {
  const { moveToNextStep } = useStepper();
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const textContent = useRef<any>(null);
  const { user } = useUserData();

  const onSubmit = async () => {
    setLoading(true);
    const result = await approveContractorApplication(user.data.email);
    setLoading(false);
    if (result && !result.error) {
      moveToNextStep();
    } else {
      alert("Saving Error");
    }
  };

  const handlePrint = useReactToPrint({
    content: () => textContent.current,
  });

  return (
    <Wrapper>
      <Header
        title="Dealer's Agreement"
        note="Please review and check the box confirming acceptance of this dealer agreement"
      />
      <div ref={textContent} className="contract-container">
        <Content />
      </div>
      <hr />
      <Checkbox
        label="By checking this I agree that I have read, understood and consent to TGUC’s dealer agreement"
        value={agreed}
        onChange={(e: any) => setAgreed(e.target.value)}
        className="checbox-wrapper"
        disabled={loading}
      />
      <div className="buttons-wrapper">
        <Button
          type="button"
          variant="contained"
          onClick={onSubmit}
          disabled={!agreed}
        >
          {loading ? "Saving..." : "Confirm"}
        </Button>
        <Button
          type="button"
          className="printButton"
          variant="outlined"
          onClick={handlePrint}
        >
          Print
        </Button>
      </div>
    </Wrapper>
  );
};

export default DealerAgreement;
