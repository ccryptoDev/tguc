import React from "react";
import { v4 as uuidv4 } from "uuid";
import SwitchButtons from "../../../../../Buttons/SwitchType";
import FormFields from "../Components/FormFields";
import Buttons from "../../../../../../molecules/Buttons/ButtonsWrapper";
import Button from "../../../../../../atoms/Buttons/Button";

// display account number according to its length
const parseAccountNumber = (value) => {
  if (value.length === 10) {
    return `****** ${value.slice(-4)}`;
  }
  return `******** ${value.slice(-4)}`;
};

// parse account object to options format: id, value
const parseAccounts = (accounts) => {
  return accounts.map((account) => ({
    id: uuidv4,
    value: parseAccountNumber(account.accountNumber),
  }));
};

const MakePaymentForm = ({
  typeOfPaymentHandler,
  switchButtons,
  form,
  getDateHandler,
  changeAmount,
  cardHandler,
  accounts,
  closeModal,
  setPage,
}) => {
  return (
    <>
      <SwitchButtons onChange={typeOfPaymentHandler} buttons={switchButtons} />
      <FormFields
        form={form}
        getDateHandler={getDateHandler}
        changeAmount={changeAmount}
        cardHandler={cardHandler}
        options={parseAccounts(accounts)}
      />
      <Buttons>
        <Button onClick={closeModal} variant="outlined" type="button">
          Cancel
        </Button>
        <Button variant="contained" onClick={() => setPage(1)} type="button">
          Next
        </Button>
      </Buttons>
    </>
  );
};

export default MakePaymentForm;
