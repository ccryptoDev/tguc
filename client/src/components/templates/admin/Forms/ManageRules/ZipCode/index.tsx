import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import Table from "./Table";
import { initForm, renderZipCodeFields } from "./config";
import Wrapper from "./styles";
import { AddButton } from "../../../../../molecules/Buttons/FormButtons";
import {
  setZipCodeToMerchant,
  getZipCodes,
} from "../../../../../../api/admin-dashboard";
import { validate } from "./validate";
import { useUserData } from "../../../../../../contexts/admin";
import ErrorMessage from "../../../../../molecules/Form/Elements/FormError";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";
import {
  parseHttpResponse,
  updateTable,
  validateRepeatingZipCode,
} from "./parsers";

const ZipCode = () => {
  const [form, setForm] = useState(initForm());
  const [tableItems, setTableItems] = useState<any[]>([]);
  const [error, setError] = useState("");
  const {
    user: { user },
  } = useUserData();
  const userId = user?.data?.userId || "";
  const [loading, setLoading] = useState<boolean>(false);

  // FETCH TABLE DATA
  const fetchTableData = async () => {
    const data: any[] = await getZipCodes(userId);
    const parsedTableData: any[] | null = parseHttpResponse(data);
    if (parsedTableData) {
      setTableItems(parsedTableData);
    } else {
      toast.error("server error");
    }
  };

  useEffect(() => {
    fetchTableData();
  }, []);

  // ADD DATA FROM RADIUS AND ZIP CODE INPUTS
  const onChangeTextInput = (e: any) => {
    if (error) setError("");
    const { name, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      [name]: { value },
    }));
  };

  // ADD ITEMS TO THE TABLE FROM FORM INPUT
  const onAddItemHandler = async () => {
    // VALIDATE FORM ITEMS
    const [isValid, updatedForm] = validate(form);

    // VALIDATE IF ENTERED ZIP CODE VALUE EXIST
    const isRepeating = validateRepeatingZipCode(form, tableItems);
    if (isRepeating) {
      setForm((prevState: any) => ({
        ...prevState,
        zipCode: { ...prevState.zipCode, message: "zip code exists" },
      }));
      return;
    }

    // SAVING ON DB AND UPDATING THE TABLE
    setLoading(true);
    if (isValid) {
      const body = updateTable(form, tableItems);
      const result: any = await setZipCodeToMerchant({
        table: body,
        userId,
      });
      if (result && !result.error) {
        // CLEAR THE FORM FIELDS
        setForm(initForm());
        await fetchTableData();
        toast.success("changes saved!");
      } else if (result.error) {
        const errorMessage = result?.error?.message || "something went wrong";
        setError(errorMessage);
      }
    } else {
      setForm(updatedForm);
    }
    setLoading(false);
  };

  return (
    <div>
      <Wrapper>
        <div className="fields-zipcode">
          {renderZipCodeFields(form).map(
            ({ component: Component, ...field }) => {
              return (
                <Component
                  onChange={onChangeTextInput}
                  {...field}
                  key={field.name}
                />
              );
            }
          )}
          <ErrorMessage message={error} />
          <div>
            <AddButton
              type="button"
              variant="contained"
              onClick={onAddItemHandler}
            >
              <AddIcon sx={{ color: "#fff", fontSize: "24px" }} />
            </AddButton>
          </div>
        </div>
        <Loader loading={loading}>
          <div className="table-container">
            <Table
              setTableItems={setTableItems}
              tableItems={tableItems}
              userId={userId}
              fetchTableData={fetchTableData}
            />
          </div>
        </Loader>
      </Wrapper>
    </div>
  );
};

export default ZipCode;
