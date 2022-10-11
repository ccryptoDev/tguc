import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import Button from "../../../../../atoms/Buttons/Button";
import { initForm, renderFields } from "./config";
import { validateForm } from "./validation";
import Error from "../../../../../molecules/Form/Elements/FieldError";
import Header from "../../../Components/FormHeader";
import Container from "../../styles";
import { mockRequest } from "../../../../../../utils/mockRequest";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";
import { IKukunPayload } from "../../../Kukun";
import { parseFormToRequest } from "../../../../../../utils/parseForm";
import { updateNewUserApplication } from "../../../../../../api/application";
import { useUserData } from "../../../../../../contexts/user";

const Form = styled.form`
  .fields-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 12px;
    margin-bottom: 20px;
  }

  @media screen and (max-width: 600px) {
    .heading {
      display: none;
    }

    .textField:first-child {
      margin-top: 12px;
    }

    .fields-wrapper {
      grid-template-columns: 1fr;
    }
  }
`;

const FormComponent = ({ isActive }: { isActive: boolean }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initForm());
  const { fetchUser } = useUserData();

  useEffect(() => {
    // POPULATE FORM WITH KUKUN DATA
    if (isActive) {
      const kukun: any = window.localStorage.getItem("estimator");
      if (kukun) {
        const parsedKukunData: IKukunPayload = JSON.parse(kukun);
        const newForm = { ...form };
        newForm.zip.value = parsedKukunData.userZipCode;
        newForm.requestedAmount.value = Math.round(
          parsedKukunData.estimatedProjectCost
        ).toString();
        setForm(newForm);
      }
    }
  }, [isActive]);

  const onSubmitHandler = async (e: any) => {
    e.preventDefault();
    const [isValid, validatedForm] = validateForm(form);

    if (isValid) {
      const payload = parseFormToRequest(validatedForm) as any;
      const userToken: any = window.localStorage.getItem("userToken");
      if (!userToken) {
        return;
      }
      const user = JSON.parse(userToken);
      payload.userId = user.id;
      setLoading(true);
      const result = await updateNewUserApplication(payload);
      setLoading(false);
      if (result && !result.error) {
        setLoading(true);
        await fetchUser();
        setLoading(false);
      } else {
        toast.error(result?.error?.message || "something went wrong");
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
          <Header
            title="Address Information"
            note="This will not affect your credit score"
          />
          <div className="fields-wrapper">
            {renderFields(form).map(({ component: Component, ...field }) => {
              return (
                <Component
                  key={field.name}
                  {...field}
                  onChange={onChangeHandler}
                />
              );
            })}
          </div>

          <Button type="submit" variant="contained">
            Confirm
          </Button>
        </Form>
      </Loader>
    </Container>
  );
};

export default FormComponent;
