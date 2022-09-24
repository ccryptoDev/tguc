import React, { useState } from "react";
import styled from "styled-components";
import { H4 } from "../../../../../../atoms/Typography";
import Button from "../../../../../../atoms/Buttons/Button";
import Loader from "../../../../../../molecules/Loaders/LoaderWrapper";

const Wrapper = styled.div`
  margin: 24px 0;
`;

const CardPayment = ({ moveToNextStep }: { moveToNextStep: any }) => {
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: any) => {
    e.preventDefault();
    setLoading(true);
    moveToNextStep();
  };

  return (
    <Wrapper>
      <Loader loading={loading}>
        <form onSubmit={onSubmit}>
          <Button type="submit" variant="contained">
            Confirm
          </Button>
        </form>
      </Loader>
    </Wrapper>
  );
};

export default CardPayment;
