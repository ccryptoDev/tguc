import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  renderPersonalInfoFields,
  initPersonalInfoForm,
  validatePIForm,
} from "./config";
import { IPersonalInfoForm } from "../../application/types";
import Header from "./Header";
import { mockRequest } from "../../../../utils/mockRequest";
import Loader from "../../../molecules/Loaders/LoaderWrapper";
import { useUserData } from "../../../../contexts/user";
import { formatDate } from "../../../../utils/formats";

const Wrapper = styled.div`
  form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 12px;
    padding: 16px;
  }

  .edit {
    & .textField input {
      background: #fff;
      border: 1px solid var(--color-border);
    }
  }

  & > .header-wrapper {
    margin: 24px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  @media screen and (max-width: 650px) {
    form {
      grid-template-columns: 1fr;
    }
  }
`;

const PersonalInfo = () => {
  const [form, setForm] = useState<IPersonalInfoForm | {}>(
    initPersonalInfoForm({})
  );
  const [loading, setLoading] = useState(false);
  const [edit, setEdit] = useState(false);
  const { user, loading: fetchingUser } = useUserData();

  useEffect(() => {
    if (user?.data) {
      user.data.dateOfBirth = formatDate(user.data.dateOfBirth);
      setForm(initPersonalInfoForm(user.data));
    }
  }, [user.data]);

  const onChangeHandler = (e: any) => {
    setForm((prevState: any) => ({
      ...prevState,
      [e.target.name]: { value: e.target.value, message: "" },
    }));
  };

  const onSaveFormData = async () => {
    const [isValid, updatedForm] = validatePIForm(form);
    if (isValid) {
      setLoading(true);
      await mockRequest();
      setLoading(false);
      setEdit(false);
    } else {
      setForm(updatedForm);
    }
  };

  const onCancelEdit = () => {
    setForm(initPersonalInfoForm(user.data));
    setEdit(false);
  };

  return (
    <Loader loading={loading || fetchingUser}>
      <Wrapper>
        <Header
          onEdit={() => setEdit(true)}
          onCancel={onCancelEdit}
          onSave={onSaveFormData}
          edit={edit}
          heading="User Information"
        />

        <form className={`${edit ? "edit" : ""}`}>
          {renderPersonalInfoFields(form).map(
            ({ component: Component, ...field }) => {
              return (
                <Component
                  key={field.name}
                  {...field}
                  onChange={onChangeHandler}
                  disabled={!edit}
                />
              );
            }
          )}
        </form>
      </Wrapper>
    </Loader>
  );
};

export default PersonalInfo;
