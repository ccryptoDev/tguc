import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  offersInit,
  renderOfferOptions,
  minimumInterestFormInit,
  renderMinimumInterestFields,
  renderZeroInterestFields,
  zeroInterestFormInit,
} from "./config";
import Buttons from "../../../../../molecules/Buttons/ButtonsWrapper";
import Button from "../../../../../atoms/Buttons/Button";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";
import ErrorMessage from "../../../../../molecules/Form/Elements/FormError";
import Wrapper, { Form } from "./styles";
import { H4 as Heading, Note } from "../../../../../atoms/Typography";
import { updateUserRules } from "../../../../../../api/admin-dashboard";
import { useUserData } from "../../../../../../contexts/admin";

const RulesDetails = () => {
  const [error, setError] = useState<string>("");
  const {
    user: { user },
    fetchUser,
  } = useUserData();
  const [offersForm, setOffersForm] = useState(offersInit());
  const [minimumInterestForm, setMinimumInterestForm] = useState(
    minimumInterestFormInit()
  );
  const [zeroInterestForm, setZeroInterestForm] = useState(
    zeroInterestFormInit()
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.data && user.data.offers) {
      if (user.data.offers.offersForm) {
        setOffersForm(offersInit(user.data.offers.offersForm));
      }
      if (user?.data?.offers?.minimumInterestForm) {
        setMinimumInterestForm(
          minimumInterestFormInit(user.data.offers.minimumInterestForm)
        );
      }
      if (user?.data?.offers?.zeroInterestForm) {
        setZeroInterestForm(
          zeroInterestFormInit(user.data.offers.zeroInterestForm)
        );
      }
    }
  }, [user.data.offers]);

  const onChangeOffersHandler = (e: any) => {
    const { name, value } = e.target;
    setOffersForm((prevState: any) => ({ ...prevState, [name]: { value } }));
  };

  const onChangeMinimumInterestHandler = (e: any) => {
    const { name, value } = e.target;
    setMinimumInterestForm((prevState: any) => ({
      ...prevState,
      [name]: { value },
    }));
  };

  const onChangeZeroInterestHandler = (e: any) => {
    const { name, value } = e.target;
    setZeroInterestForm((prevState: any) => ({
      ...prevState,
      [name]: { value },
    }));
  };
  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = {
      offersForm,
      minimumInterestForm,
      zeroInterestForm,
    };
    setLoading(true);
    const response: any = await updateUserRules(body);
    if (response && !response.error) {
      toast.success("changes saved!");
      await fetchUser();
    } else if (response.error) {
      const errorMessage = response?.error?.message || "something went wrong";
      setError(errorMessage);
    }
    setLoading(false);
  };

  return (
    <Loader loading={loading}>
      <Form onSubmit={onSubmitHandler}>
        <Wrapper>
          {renderOfferOptions(offersForm).map(
            ({ component: Component, ...field }) => {
              return (
                <Component
                  key={field.name}
                  onChange={onChangeOffersHandler}
                  {...field}
                />
              );
            }
          )}
        </Wrapper>
        <div>
          <Heading>Promo: Deferred Interest With Minimum Payment</Heading>
          <Note>Available for A+, A, and B tiers</Note>
        </div>
        <Wrapper>
          {renderMinimumInterestFields(minimumInterestForm).map(
            ({ component: Component, ...field }) => {
              return (
                <Component
                  key={field.name}
                  onChange={onChangeMinimumInterestHandler}
                  {...field}
                />
              );
            }
          )}
        </Wrapper>
        <div>
          <Heading>
            Promo: Interest Deferred - Zero Interest No Monthly Payments
          </Heading>
          <Note>Available for A+, A, and B tiers</Note>
        </div>
        <Wrapper>
          {renderZeroInterestFields(zeroInterestForm).map(
            ({ component: Component, ...field }) => {
              return (
                <Component
                  key={field.name}
                  onChange={onChangeZeroInterestHandler}
                  {...field}
                />
              );
            }
          )}
        </Wrapper>
        <ErrorMessage message={error} />
        <Buttons>
          <Button variant="contained" type="submit">
            Save
          </Button>
        </Buttons>
      </Form>
    </Loader>
  );
};

export default RulesDetails;
