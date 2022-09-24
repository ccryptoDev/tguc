import React from "react";
import styled from "styled-components";
import Button from "../atoms/Buttons/Button";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 10px;
`;

const Buttons = () => {
  return (
    <Wrapper>
      <p>Contained</p>
      <Button type="button" variant="contained">
        Button
      </Button>
      <Button type="button" variant="contained" disabled>
        Button
      </Button>
      <p>Outlined</p>
      <Button type="button" variant="outlined">
        Button
      </Button>
      <Button type="button" variant="outlined" disabled>
        Button
      </Button>
      <p>Text</p>
      <Button type="button" variant="text">
        Button
      </Button>
      <Button type="button" variant="text" disabled>
        Button
      </Button>
    </Wrapper>
  );
};

export default Buttons;
