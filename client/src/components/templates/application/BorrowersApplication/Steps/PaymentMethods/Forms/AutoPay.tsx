import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import Button from "../../../../../../atoms/Buttons/Button";
import { initForm, populateBillingAddress } from "./config";
import { validate as validateCardForm } from "./Card/validate";
import { validate as validateHomeAddress } from "./validateAddress";
import Container from "../../../styles";
import Loader from "../../../../../../molecules/Loaders/LoaderWrapper";
import Card from "./Card";
import BillingAddress from "./BillingAddress";
import { addCardApi } from "../../../../../../../api/application";
import { parseFormToFormat } from "../../../../../../../utils/form/parsers";
import { useUserData } from "../../../../../../../contexts/user";

const Form = styled.form`
  .fields-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;

    & .textField:nth-child(9) {
      grid-column: 1/-1;
    }
  }

  @media screen and (max-width: 500px) {
    .fields-wrapper {
      grid-template-columns: 1fr;
    }
  }
`;

const payload = (data: any) => {
  return {
    screenTracking: data.screenTrackingId,
    cardNumber: data.cardNumber,
    cardName: data.fullName,
    accountNumber: data.accountNumber,
    routingNumber: data.routingNumber,
    financialInstitution: data.financialInstitution,
    accountType: data.accountType,
    manualPayment: data.manualPayment,
    expiryDate: data.expirationDate,
    securityCode: data.securityCode,
    billingAddress1: data.street,
    billingCity: data.city,
    billingFirstName: data.firstName,
    billingLastName: data.lastName,
    billingState: data.state,
    billingZip: data.zipCode,
  };
};

const PaymentMethod = () => {
  const [form, setForm] = useState(initForm());
  const [isHomeAddress, setIsHomeAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, screenTrackingId, fetchUser } = useUserData();

  useEffect(() => {
    const billingAddressHandler = () => {
      const updatedForm: any = populateBillingAddress(user.data, form);
      setForm(updatedForm);
    };
    if (isHomeAddress) {
      billingAddressHandler();
    }
  }, [isHomeAddress]);

  const onSubmitHandler = async (e: any) => {
    e.preventDefault();
    const [isValid, validatedForm] = validateCardForm(form);
    if (isValid) {
      const [isAddressValid, updatedForm] = validateHomeAddress(form);
      if (isAddressValid) {
        setLoading(true);
        const parsedForm = parseFormToFormat(updatedForm);

        const result = await addCardApi({
          ...payload(parsedForm),
          screenTrackingId,
        });
        if (result && !result.error) {
          await fetchUser();
        } else {
          toast.error("something went wrong");
        }
        setLoading(false);
      } else {
        setForm(updatedForm);
      }
    } else {
      setForm(validatedForm);
    }
  };

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevState: any) => ({
      ...prevState,
      [name]: { ...prevState[name], value, message: "" },
    }));
  };

  return (
    <Container>
      <Loader loading={loading}>
        <Form onSubmit={onSubmitHandler}>
          <Card form={form} onChangeHandler={onChangeHandler} />
          <BillingAddress
            form={form}
            onChangeHandler={onChangeHandler}
            setIsHomeAddress={setIsHomeAddress}
            isHomeAddress={isHomeAddress}
          />

          <Button type="submit" variant="contained">
            Confirm
          </Button>
        </Form>
      </Loader>
    </Container>
  );
};

export default PaymentMethod;
