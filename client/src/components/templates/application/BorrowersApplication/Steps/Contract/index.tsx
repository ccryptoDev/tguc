/* eslint no-underscore-dangle:0 */
import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useReactToPrint } from "react-to-print";
import { toast } from "react-toastify";
import PromissoryNote from "./Ric";
import SignaturePad from "./SignaturePad";
import {
  fetchRicApi,
  saveSignature,
  createRicApi,
  fetchContractApi,
  finalizeContractApi,
} from "../../../../../../api/application";
import { useUserData } from "../../../../../../contexts/user";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";
import ErrorMessage from "../../../../../molecules/Form/Elements/FormError";
import { mockRequest } from "../../../../../../utils/mockRequest";
import { useStepper } from "../../../../../../contexts/steps";
import Header from "./Header";
import Button from "../../../../../atoms/Buttons/Button";

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
  const ricContent = useRef<any>();
  const [ricData, setRicData] = useState();
  const [error, setError] = useState("");
  const [formLaoding, setFormLoading] = useState(false);
  const { screenTrackingId, user, userId } = useUserData();
  const [loading, setLoading] = useState(false);
  const { moveToNextStep } = useStepper();
  const textContent = useRef<any>();

  const fetchRic = async () => {
    const userSignature = user?.data?.doc?.signature;
    if (screenTrackingId) {
      const result = await fetchContractApi(screenTrackingId);
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
    if (screenTrackingId && isActive && !completed) fetchRic();
  }, [user.data, screenTrackingId, isActive, completed]);

  const save = async () => {
    if (!sigCanvas.current.isEmpty()) {
      setFormLoading(true);
      await mockRequest();
      const sigURI = sigCanvas.current.getTrimmedCanvas().toDataURL();
      setSignature(sigURI);
      const payload = {
        userId: user?.data?.id,
        data: sigURI.replace(",", "removeit").split("removeit")[1],
      };
      // await saveSignature(payload);
      // await fetchUser();
      toast.success("signature has been saved");
      setFormLoading(false);
    }
  };

  const onSubmitHandler = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    await finalizeContractApi({ screenTrackingId, userId });

    setLoading(false);
    moveToNextStep();
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
          <Loader loading={formLaoding}>
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
