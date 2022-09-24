import React, { useState } from "react";
import styled from "styled-components";
import Button from "../../../../../atoms/Buttons/Button";
import { initForm, renderFields, renderBusinessAddressFields } from "./config";
import { validateForm } from "./validation";
import Error from "../../../../../molecules/Form/Elements/FieldError";
import Header from "../../../Components/FormHeader";
import Container from "../../styles";
import { mockRequest } from "../../../../../../utils/mockRequest";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";
import { useStepper } from "../../../../../../contexts/steps";
import {
  updateBusinessData,
  getPracticeManagementByScreenTrackingId,
} from "../../../../../../api/application";
import { useUserData } from "../../../../../../contexts/user";

const Form = styled.form`
  .file-fields-wrapper {
    margin: 20px 0;
  }

  .fields-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 12px;
    margin-bottom: 20px;
  }

  .terms-wrapper {
    margin: 24px 0;
  }

  @media screen and (max-width: 500px) {
    .fields-wrapper {
      grid-template-columns: 1fr;
    }
  }
`;

const FormComponent = ({ moveToNextStep }: { moveToNextStep: any }) => {
  const { loading: userIsLoading } = useStepper();
  const [form, setForm] = useState(initForm());
  const [loading, setLoading] = useState(false);
  const { user } = useUserData();

  const onSubmitHandler = async (e: any) => {
    e.preventDefault();
    const [isValid, validatedForm] = validateForm(form);

    if (isValid) {
      setLoading(true);
      await mockRequest();
      setLoading(false);
      await updateBusinessData(user?.data?.screenTracking?.id, form);
      moveToNextStep();
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

  React.useEffect(() => {
    if (user?.data?.screenTracking?.id) {
      const getPM = async () => {
        const pmData: any = await getPracticeManagementByScreenTrackingId(
          user?.data?.screenTracking?.id
        );
        if (pmData?.data) {
          setForm((prevState: any) => ({
            ...prevState,
            name: {
              ...prevState.name,
              value: pmData.data.practiceName,
              message: "",
            },
            YearsInBusiness: {
              ...prevState.yearsInBusiness,
              value: pmData.data.yearsInBusiness,
              message: "",
            },
            city: {
              ...prevState.city,
              value: pmData.data.city,
              message: "",
            },
            email: {
              ...prevState.email,
              value: pmData.data.email,
              message: "",
            },
            phone: {
              ...prevState.phone,
              value: pmData.data.phone,
              message: "",
            },
            state: {
              ...prevState.state,
              value: pmData.data.stateCode,
              message: "",
            },
            street: {
              ...prevState.street,
              value: pmData.data.address,
              message: "",
            },
            tin: {
              ...prevState.tin,
              value: pmData.data.tin,
              message: "",
            },
            website: {
              ...prevState.website,
              value: pmData.data.url,
              message: "",
            },
            zip: {
              ...prevState.zip,
              value: pmData.data.zip,
              message: "",
            },
          }));
        }
      };
      getPM();
    }
  }, [user?.data?.screenTracking?.id]);
  return (
    <Container>
      <Loader loading={loading || userIsLoading}>
        <Form onSubmit={onSubmitHandler}>
          <Header title="Company's Info" />
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
          <Header title="Business's Address" />
          <div className="fields-wrapper">
            {renderBusinessAddressFields(form).map(
              ({ component: Component, ...field }) => {
                return (
                  <Component
                    key={field.name}
                    {...field}
                    onChange={onChangeHandler}
                  />
                );
              }
            )}
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
