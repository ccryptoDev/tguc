/* eslint no-underscore-dangle:0 */
import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import PromissoryNote from "./Ric";
import SignaturePad from "./SignaturePad";
import {
  fetchRicApi,
  saveSignature,
  createRicApi,
} from "../../api/application";
import { useUserData } from "../../contexts/user";
import Loader from "../../components/molecules/Loaders/LoaderWrapper";
import ErrorMessage from "../../components/molecules/Form/Elements/FormError";
import TermsAndConditions from "../../components/organisms/Buttons/Terms";
import { useLoanData } from "../../hooks/loanData";
import { mockRequest } from "../../utils/mockRequest";
import { useStepper } from "../../contexts/steps";
import Header from "./Header";
import Button from "../../components/atoms/Buttons/Button";

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
`;

const Form = styled.form`
  .heading {
    margin-bottom: 20px;
  }

  .form-layout {
    margin-bottom: 20px;

    .buttons {
      display: flex;
      width: 270px;
      justify-content: space-between;
      padding: 10px;
    }

    .printButton {
      display: block;
      margin: 0 auto;
    }
  }

  button {
    &:hover {
      box-shadow: none;
    }
  }
`;

function FormComponent() {
  const [signature, setSignature] = useState<string | null>(null);
  const sigCanvas = useRef<any>({});
  const ricContent = useRef<any>();
  const [ricData, setRicData] = useState();
  const { user, fetchUser } = useUserData();
  const [error, setError] = useState("");
  const [formLaoding, setFormLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { loanData } = useLoanData(user?.data);
  const history = useHistory();
  const screenTracking = loanData?.screenTracking;
  const [loading, setLoading] = useState(false);
  const { moveToNextStep, currentStep } = useStepper();
  const [signaturesCollected, setSignaturesCollected] = useState<number>(0);

  useEffect(() => {
    async function fetchRic() {
      const id = screenTracking._id;
      const userSignature = user?.data?.doc?.signature;
      if (id) {
        const result = await fetchRicApi(id);
        if (result && result?.data && !result.error) {
          setRicData(result.data);
          setSignature(userSignature);
        } else if (result?.error) {
          const { message } = result?.error;
          setError(message);
        }
      }
    }
    if (screenTracking) fetchRic();
  }, [user.data, screenTracking]);

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
    await mockRequest();
    // const result = await createRicApi({ screenTrackingId: screenTracking._id });
    // if (result && !result.error) {
    //   const data = await fetchUser();
    // }
    setLoading(false);
    moveToNextStep();
  };

  return (
    <Styles>
      <Form onSubmit={onSubmitHandler}>
        <div className="form-layout">
          <Header />
          <Loader loading={formLaoding}>
            {!signature && <SignaturePad sigCanvas={sigCanvas} save={save} />}
          </Loader>
          <PromissoryNote
            loanData={loanData}
            ricData={ricData}
            user={user}
            loading={loading}
            addSignature={() => setSignaturesCollected(signaturesCollected + 1)}
          />
          <Button
            type="submit"
            variant="outlined"
            className="mt-24"
            disabled={signaturesCollected < 3 || loading}
          >
            {loading ? "SAVING YOUR CONTRACT..." : "AGREE AND FINALIZE"}
          </Button>
        </div>

        <ErrorMessage message={error} />
      </Form>
    </Styles>
  );
}

export default FormComponent;
