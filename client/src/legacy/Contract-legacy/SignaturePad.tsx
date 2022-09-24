import React from "react";
import styled from "styled-components";
import SignatureCanvas from "react-signature-canvas";
import Button from "../../components/atoms/Buttons/Button";
import { Note, H3 } from "../../components/atoms/Typography";
import ButtonWrapper from "../../components/atoms/Form/Buttons-wrapper";

type IProps = {
  sigCanvas: any;
  save: any;
};

const Wrapper = styled.div`
  padding: 24px;
  border-radius: 14px;
  margin: 24px 0;
  background: #fbfbff;
  & h2 {
    font-weight: 700;
  }

  & .note {
    margin: 12px 0;
  }

  .btn-secondary {
    background: transparent;
  }

  .sigcanvas {
    border: 1px solid var(--color-border);
    background: #fff;
    border-radius: 14px;
    margin: 10px 0;
    height: 200px;
    max-width: 997px;
    width: 100%;
  }

  @media screen and (max-width: 767px) {
    padding: 12px;
  }
`;

function SignaturePad({ sigCanvas, save }: IProps) {
  const clear = () => sigCanvas.current.clear();
  return (
    <Wrapper>
      <H3>Create your sign</H3>
      <Note className="note color-text">
        Please click and hold your mouse to sign your signature in the box
        below. You will need to sign the fields below with your signature.
      </Note>
      <SignatureCanvas
        ref={sigCanvas}
        canvasProps={{
          className: "sigcanvas",
        }}
      />
      <ButtonWrapper>
        <Button type="button" variant="contained" onClick={save}>
          Accept
        </Button>
        <Button
          type="button"
          variant="outlined"
          className="btn-secondary"
          onClick={clear}
        >
          Clear
        </Button>
      </ButtonWrapper>
    </Wrapper>
  );
}

export default SignaturePad;
