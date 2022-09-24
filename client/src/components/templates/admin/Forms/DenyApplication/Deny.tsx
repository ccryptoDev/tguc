import React, { useState } from "react";
import { toast } from "react-toastify";
import Button from "../../../../atoms/Buttons/Button";
import Buttons from "../../../../molecules/Buttons/SubmitForm";
import Loader from "../../../../molecules/Loaders/LoaderWrapper";
import Form from "./Styles";
import ErrorMessage from "../../../../molecules/ErrorMessage/FormError";
import { declineBorrowerApplication } from "../../../../../api/admin-dashboard";

type IForm = {
  reasonOptions: string[];
  reasonValue?: string;
};

type IProps = {
  closeModal: any;
  state: {
    data: {
      id?: string;
    };
  };
  cb: Function;
};
const denyOptions = [
  "Credit application incomplete",
  "Income insufficient for amount of credit requested",
  "Excessive obligations in relation to income",
  "Unable to verify income",
  "Insufficient collateral / applicant must own residence",
  "No credit file",
  "Poor credit performance with us",
  "Limited credit experience",
  "Delinquent past or present credit obligations with others",
  "Collection action or judgment",
  "Garnishment or attachment",
  "Foreclosure or repossession",
  "Bankruptcy",
  "Number of recent inquiries on credit bureau report",
  "Other",
];

const DenyApplicationForm = ({ closeModal, state, cb }: IProps) => {
  const initialValue: IForm = {
    reasonOptions: [],
    reasonValue: "",
  };
  const [form, setForm] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isSelectedAll, setIsSelectedAll] = useState<boolean>(false);

  const onCheckChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setErrorMessage("");
    const val = e.target.value;
    const isChecked = e.target.checked;
    setForm((prevState: any) => {
      let { reasonOptions } = prevState;
      if (isChecked) {
        if (reasonOptions.indexOf(val) === -1) {
          reasonOptions.push(val);
        }
      } else {
        reasonOptions = reasonOptions.filter((o: string) => o !== val);
      }
      return {
        reasonOptions,
        reasonValue: val !== "Other" ? "" : prevState.reasonValue,
      };
    });
  };

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setErrorMessage("");
    setForm((prevState: any) => {
      return {
        ...prevState,
        reasonValue: e.target.value,
      };
    });
  };

  const onToggleAll = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const isChecked = e.target.checked;
    setIsSelectedAll(isChecked);
    setForm((prevState: any) => {
      const reasonValue = isChecked ? prevState.reasonValue : "";
      const reasonOptions = isChecked ? denyOptions : [];
      return {
        reasonOptions,
        reasonValue,
      };
    });
  };

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // validate
    if (
      !form.reasonOptions.length ||
      (form.reasonOptions.indexOf("Other") !== -1 && !form.reasonValue)
    ) {
      setErrorMessage("Please provide the reason");
      return;
    }
    setLoading(true);
    if (state?.data?.id) {
      const result: any = await declineBorrowerApplication(
        state?.data?.id,
        form
      );
      if (result && !result.error) {
        await cb(state?.data?.id); //update UI
        toast.success("The application was denied.");
        closeModal();
      } else if (result.error) {
        const message = result?.error?.message || "something went wrong";
        setErrorMessage(message);
      }
    }
    setLoading(false);
  };

  return (
    <Loader loading={loading ? 1 : 0}>
      <Form onSubmit={onSubmitHandler} className="content">
        Are you sure you want to deny this application?
        <br />
        <br />
        <label htmlFor="toggleAll">
          <input
            id="toggleAll"
            className="toggle"
            type="checkbox"
            checked={isSelectedAll}
            onChange={(e) => onToggleAll(e)}
          />
          <span style={{ marginLeft: "8px" }}>Select / De-Select All</span>
        </label>
        <br />
        <br />
        {denyOptions.map((option: string, index: number) => (
          <>
            <label
              htmlFor={`checkbox${index}`}
              key={option.toLowerCase().replace(/ /g, "-")}
            >
              <input
                id={`checkbox${index}`}
                className="toggle"
                type="checkbox"
                value={option}
                checked={form.reasonOptions.indexOf(option) !== -1}
                onChange={(e) => onCheckChanged(e)}
              />
              <span style={{ marginLeft: "8px" }}>{option}</span>
            </label>
            <br />
          </>
        ))}
        <br />
        {form.reasonOptions.indexOf("Other") !== -1 && (
          <>
            <input
              type="text"
              placeholder="Deny Reason"
              name="query"
              onChange={(e) => onChangeHandler(e)}
            />
            <br />
          </>
        )}
        <br />
        {errorMessage ? <ErrorMessage message={errorMessage} /> : ""}
        <Buttons>
          <Button onClick={closeModal} variant="outlined" type="button">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Deny
          </Button>
        </Buttons>
      </Form>
    </Loader>
  );
};
export default DenyApplicationForm;
