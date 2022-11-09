/* eslint no-underscore-dangle:0 */
import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useReactToPrint } from "react-to-print";
import { toast } from "react-toastify";
import PromissoryNote from "./Ric";
import SignaturePad from "./SignaturePad";
import {
  fetchContractDataApi,
  finalizeContractApi,
  saveSignatureApi,
} from "../../../../../../api/contract";
import { useUserData } from "../../../../../../contexts/user";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";
import ErrorMessage from "../../../../../molecules/Form/Elements/FormError";
import Button from "../../../../../atoms/Buttons/Button";
import { parseCanvasString } from "../../../../../../utils/base64";

const Styles = styled.div`
  width: 100%;
  border: 1px solid var(--color-grey-light);
  border-radius: 14px;
  background: #fff;
  .note {
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
    margin-bottom: 12px;
  }

  .img-wrapper {
    margin-right: 40px;
  }

  @media screen and (max-width: 1024px) {
    padding: 12px;
  }

  @media screen and (max-width: 900px) {
    padding: 6px;
  }

  @media print {
    .contract-container {
      height: 11in;
      width: 8.5in;
    }

    body {
      font-size: 10pt;
    }
    .no-break {
      page-break-inside: avoid;
    }
  }

  @page {
    margin: 20mm 10mm;
  }
`;

const Form = styled.form`
  .heading {
    margin-bottom: 20px;
  }

  .form-layout {
    margin-bottom: 20px;
  }

  button {
    &:hover {
      box-shadow: none;
    }
  }

  .buttons-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;

const Contract = ({
  isActive,
  completed,
}: {
  isActive: boolean;
  completed: boolean;
}) => {
  const [signature, setSignature] = useState<string | null>(null);
  const sigCanvas = useRef<any>({});
  const [ricData, setRicData] = useState();
  const [error, setError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const { screenTrackingId, user, fetchUser } = useUserData();
  const [loading, setLoading] = useState(false);
  const textContent = useRef<any>();

  const fetchContractData = async () => {
    const userSignature = user?.data?.doc?.signature;
    if (screenTrackingId) {
      const result = await fetchContractDataApi();
      if (result && result?.data && !result.error) {
        setRicData(result.data);
        setSignature(userSignature);
      } else if (result?.error) {
        const { message } = result?.error;
        setError(message);
      }
    }
  };

  useEffect(() => {
    if (screenTrackingId && isActive && !completed) fetchContractData();
  }, [user.data, screenTrackingId, isActive, completed]);

  const save = async () => {
    if (!sigCanvas.current.isEmpty()) {
      const sigURI = sigCanvas.current.getTrimmedCanvas().toDataURL();
      setSignature(sigURI);
      const payload = {
        screenTrackingId,
        imgBase64: parseCanvasString(sigURI),
      };
      setFormLoading(true);
      const result = await saveSignatureApi(payload);
      setFormLoading(false);
      if (result && !result.error) {
        await fetchUser();
        toast.success("signature has been saved");
      } else {
        toast.error("could not save the signature");
      }
    }
  };

  const onSubmitHandler = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const result = await finalizeContractApi();
    setLoading(false);
    if (result && !result.error) {
      await fetchUser();
    } else {
      toast.error("could not finalize the contract");
    }
  };

  const handlePrint = useReactToPrint({
    content: () => textContent.current,
  });

  return (
    <Styles>
      <Form onSubmit={onSubmitHandler}>
        <div className="form-layout">
          <div ref={textContent} className="contract-container">
            <PromissoryNote ricData={ricData} signature={signature} />
          </div>
          <Loader loading={formLoading}>
            {!signature && <SignaturePad sigCanvas={sigCanvas} save={save} />}
          </Loader>
          <div className="buttons-wrapper">
            <Button type="submit" variant="outlined" disabled={!signature}>
              {loading ? "SAVING YOUR CONTRACT..." : "AGREE AND FINALIZE"}
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
        </div>

        <ErrorMessage message={error} />
      </Form>
    </Styles>
  );
};

export default Contract;
