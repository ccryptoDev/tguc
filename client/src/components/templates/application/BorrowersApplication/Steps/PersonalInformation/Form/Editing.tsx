import React, { useEffect, useState } from "react";
import Button from "../../../../../../atoms/Buttons/Button";
import { initForm, renderFields } from "../config";
import { validateForm } from "../validation";
import { parseFormToRequest } from "../../../../../../../utils/parseForm";
import {
  formStringToDate,
  formatDate,
} from "../../../../../../../utils/formats";
import Loader from "../../../../../../molecules/Loaders/LoaderWrapper";
import { useUserData } from "../../../../../../../contexts/user";
import Form from "./styles";

const FormComponent = ({ moveToNextStep }: { moveToNextStep: any }) => {
  const [form, setForm] = useState(initForm({}));
  const [loading, setLoading] = useState(false);
  const { user } = useUserData();

  useEffect(() => {
    const mobilePhone = user?.data?.phones[0];
    const dateOfBirth = formatDate(user?.data?.dateOfBirth);
    setForm(initForm({ ...user.data, mobilePhone, dateOfBirth }));
  }, []);

  // CREATE APPLICATION
  const onSubmitHandler = async (e: any) => {
    e.preventDefault();
    // REMOVE PASSWORD FROM VALIDATION
    const updatedForm = { ...form };
    updatedForm.password.required = false;
    updatedForm.repassword.required = false;

    const [isValid, validatedForm] = validateForm(updatedForm);

    if (isValid) {
      setLoading(true);
      const payload = parseFormToRequest(validatedForm) as any;

      const { mobilePhone, dateOfBirth } = payload;

      const parsedPayload = {
        ...payload,
        phones: [mobilePhone],
        dateOfBirth: formStringToDate(dateOfBirth),
        source: "web",
      };

      moveToNextStep();

      setLoading(false);
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
    if ((window as any).instnt) {
      (window as any).instnt.formData = parseFormToRequest(form);
    }
  };

  return (
    <Loader loading={loading}>
      <Form onSubmit={onSubmitHandler}>
        <div className="fields-wrapper">
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
        <div>
          <Button type="submit" variant="contained">
            Confirm
          </Button>
        </div>
      </Form>
    </Loader>
  );
};

export default FormComponent;
