import React, { useState, useEffect } from "react";
import Button from "../../../../../../atoms/Buttons/Button";
import { initForm, renderFields } from "../config";
import { validateForm } from "../validation";
import { parseFormToRequest } from "../../../../../../../utils/parseForm";
import Loader from "../../../../../../molecules/Loaders/LoaderWrapper";
import Form from "./styles";
import {
  formStringToDate,
  formatDate,
} from "../../../../../../../utils/formats";
import { useUserData } from "../../../../../../../contexts/user";

const FormComponent = ({ moveToNextStep }: { moveToNextStep: any }) => {
  const [form, setForm] = useState(initForm({}));
  const [loading, setLoading] = useState(false);
  const { user } = useUserData();

  useEffect(() => {
    const phone = user?.data?.phones[0];
    const dateOfBirth = formatDate(user?.data?.dateOfBirth);
    setForm(initForm({ ...user.data, phone, dateOfBirth }));
  }, []);

  const onSubmitHandler = async (e: any) => {
    e.preventDefault();
    // REMOVE PASSWORD FROM VALIDATION
    const updatedForm = { ...form };
    updatedForm.password.required = false;
    updatedForm.repassword.required = false;
    setLoading(true);
    const [isValid, validatedForm] = validateForm(form);

    if (isValid) {
      const payload = parseFormToRequest(validatedForm) as any;

      const { phone, dateOfBirth } = payload;

      const parsedPayload = {
        ...payload,
        phones: [phone],
        dateOfBirth: formStringToDate(dateOfBirth),
        source: "web",
      };

      moveToNextStep();
    } else {
      setForm(validatedForm);
    }
    setLoading(false);
  };

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevState: any) => ({
      ...prevState,
      [name]: { ...prevState[name], value, message: "" },
    }));
  };

  return (
    <Loader loading={loading}>
      <Form onSubmit={onSubmitHandler}>
        <div className="contractor-fields-wrapper">
          {renderFields(form, true).map(
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
  );
};

export default FormComponent;
