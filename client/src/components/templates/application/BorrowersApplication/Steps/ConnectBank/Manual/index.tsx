import React, { useState } from "react";
import styled from "styled-components";
import { initForm, renderFormFields, validateForm } from "./config";
import { parseFormToRequest } from "../../../../../../../utils/parseForm";
import Button from "../../../../../../atoms/Buttons/Button";
import ActionButton from "../../../../../../molecules/Buttons/ActionButton";
import { H2 as Heading, Note } from "../../../../../../atoms/Typography";
import { mockRequest } from "../../../../../../../utils/mockRequest";
import Loader from "../../../../../../molecules/Loaders/LoaderWrapper";
import Modal from "../../../../../../organisms/Modal/Regular/ModalAndTriggerButton";
import ModalContent from "./Paycheck";

const Form = styled.form`
  .fields-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 1.2rem;
    margin: 1.2rem 0;

    & .textField {
      grid-column: 1/-1;
      &:nth-child(3) {
        grid-column: 1/2;
      }
      &:nth-child(4) {
        grid-column: 2/3;
      }
    }
  }

  .buttons-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;

    & .modal-button {
      text-decoration: underline;
      color: var(--color-blue-1);
    }
  }

  .subheading-wrapper {
    display: flex;
    align-items: center;

    & .action-button {
      margin-right: 12px;
      border: 1px solid var(--color-blue-1);
      border-radius: 0;

      & svg path {
        stroke: var(--color-blue-1);
      }
    }
  }

  @media screen and (max-width: 767px) {
    .textField {
      margin: 12px 0;
    }
  }

  @media screen and (max-width: 500px) {
    .fields-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0;
    }
    .buttons-wrapper {
      flex-direction: column;
      gap: 10px;
    }
  }
`;

const ChooseProviderForm = ({
  setActiveTab,
  setConnected,
  tabType,
  setSelectedBank,
  loginToBankHandler,
}: {
  setActiveTab: any;
  setConnected: any;
  tabType: { AUTO: string; MANUAL: string };
  setSelectedBank: any;
  loginToBankHandler: any;
}) => {
  const [form, setForm] = useState(initForm());
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e: any) => {
    e.preventDefault();
    const [isValid, validatedForm] = validateForm(form);
    if (isValid) {
      setLoading(true);
      const payload = parseFormToRequest(validatedForm);
      await mockRequest();
      setConnected(true);
      loginToBankHandler();
      setLoading(false);
    } else {
      setForm(validatedForm);
    }
  };
  const onChangeHandler = (e: any) => {
    setForm((prevState) => ({
      ...prevState,
      [e.target.name]: { value: e.target.value, message: "" },
    }));
  };

  return (
    <Loader loading={loading}>
      <Form onSubmit={onSubmitHandler}>
        <Heading>Banking Information </Heading>
        <div className="subheading-wrapper">
          <ActionButton
            type="goback"
            onClick={() => setActiveTab(tabType.AUTO)}
          />
          <Note>Manually Submit Banking Information</Note>
        </div>
        <div className="fields-wrapper">
          {renderFormFields(form).map(({ component: Component, ...field }) => {
            return (
              <Component
                key={field.name}
                {...field}
                onChange={onChangeHandler}
              />
            );
          })}
        </div>
        <div className="buttons-wrapper">
          <Button type="submit" variant="contained">
            Continue
          </Button>
          <Modal
            button={
              <div className="modal-button">
                Can&apos;t find Routing or Account Number
              </div>
            }
            modalContent={ModalContent}
            modalTitle="Routing and Account Number"
          />
        </div>
      </Form>
    </Loader>
  );
};

export default ChooseProviderForm;
