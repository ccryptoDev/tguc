import React from "react";
import styled from "styled-components";
import { Form, BankLogo } from "../styles";
import Button from "../../../../../../atoms/Buttons/Button";
import { useStepper } from "../../../../../../../contexts/steps";
import Header from "../../../../Components/FormHeader";
import { getRequester } from "../../../../../../../api/requester";
import { stepNames } from "../../config";
import { useUserData } from "../../../../../../../contexts/user";
import { changeUserLastScreen } from "../../../../../../../api/application";

const Wrapper = styled.div`
  .logo {
    max-width: 100%;
    width: 100%;
  }
`;

const ButtonsWrapper = styled.div`
  max-width: 342px;
  width: 100%;
  margin-top: 24px;

  .login-buttons {
    display: flex;
    align-items: center;
    column-gap: 12px;
  }

  .btn {
    &-continue {
      width: 164px;
    }
    &-relogin {
      border: none;
      background: transparent;
      color: var(--color-primary);
      font-weight: 600;
      font-size: 14px;
      padding: 20px;
      min-width: 170px;
    }
    &-manual {
      margin-top: 12px;
      width: 100%;
    }
  }

  @media screen and (max-width: 400px) {
    .login-buttons {
      flex-wrap: wrap;

      & button {
        width: 100%;
      }
    }
  }
`;

const ChooseProviderForm = ({
  selectedBank,
  setActiveTab,
  tabType,
  loginToBankHandler,
  setConnected,
}: {
  selectedBank: any;
  setActiveTab: any;
  tabType: any;
  loginToBankHandler: any;
  setConnected: any;
}) => {
  const { moveToNextStep } = useStepper();
  const { user } = useUserData();
  const userId = user?.data?.userId;

  const sendWelcomeEmail = () => {
    getRequester()
      .post("api/plaid/email/welcome")
      .then((res) => {
        console.log(res);
      });
  };
  const onSubmitHandler = async (e: any) => {
    e.preventDefault();
    const userToken: any = window.localStorage.getItem("userToken");
    if (!userToken) {
      return;
    }
    // const user = JSON.parse(userToken);

    sendWelcomeEmail();
    // await sendNewApplicationEmail(user.id);
    await changeUserLastScreen(userId, stepNames.WAITING_FOR_APPROVAL);
    moveToNextStep();
    loginToBankHandler();
  };

  const goToManual = () => {
    setConnected(false);
    setActiveTab(tabType.MANUAL);
  };

  const goToAuto = () => {
    setConnected(false);
    setActiveTab(tabType.AUTO);
  };

  const title = "Banking Information";
  const note = "Login to your bank account to get the best offer.";

  return (
    <Wrapper>
      <Form onSubmit={onSubmitHandler}>
        <Header title={title} note={note} />

        <BankLogo key={selectedBank.name} className="logo">
          <img src={selectedBank.img} alt={selectedBank.name} />
        </BankLogo>

        <ButtonsWrapper>
          <div className="login-buttons">
            <Button type="submit" variant="contained" className="btn-continue">
              Continue
            </Button>

            <button type="button" onClick={goToAuto} className="btn-relogin">
              Re-login to bank
            </button>
          </div>
          <Button
            type="button"
            variant="outlined"
            onClick={goToManual}
            className="btn-manual"
          >
            Manually Submit Banking Information
          </Button>
        </ButtonsWrapper>
      </Form>
    </Wrapper>
  );
};

export default ChooseProviderForm;
