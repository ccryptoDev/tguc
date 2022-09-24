import React, { useState, useEffect } from "react";
import AddIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import Table from "./Table";
import { initForm, renderSelectFields } from "./config";
import Wrapper from "./styles";
import { AddButton } from "../../../../../molecules/Buttons/FormButtons";
import { H5 as Heading } from "../../../../../atoms/Typography";
import { useUserData } from "../../../../../../contexts/admin";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";
import { verticalsOptions } from "./options";
import { getRequester } from "../../../../../../api/admin-dashboard/requester";
import baseUrl from "../../../../../../app.config";

const Verticals = () => {
  const [form, setForm] = useState(initForm());
  const [options, setOptions] = useState<any[]>([]);
  const [tableItems, setTableItems] = useState<any[]>([]);

  const {
    user: { user },
  } = useUserData();
  const userId = user?.data?.userId || "";
  const [loading, setLoading] = useState<boolean>(false);

  const onUpdateOptionsHandler = (updatedTableItems: any[]) => {
    setTableItems(updatedTableItems);
  };

  // FETCH TABLE DATA
  const fetchTableData = async () => {
    // FETCH INITIAL VERTICALS OPTIONS AND TABLE ITEMS
    const initialOptions = verticalsOptions;
    if (initialOptions) {
      setOptions(initialOptions);
      setLoading(true);
      getRequester()
        .get(`${baseUrl}/api/admin/dashboard/verticals`)
        .then((response) => {
          setLoading(false);
          const verticals = response.data;
          onUpdateOptionsHandler(verticals);
        })
        .catch((err) => {
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchTableData();
  }, []);

  // ADD DATA FROM VERTICALS INPUT
  const onChangeSelectOptions = (e: any, name: string) => {
    setForm((prevState: any) => ({
      ...prevState,
      [name]: { value: e },
    }));
  };

  // ADD ITEMS TO THE TABLE FROM FORM INPUT
  const onAddItemHandler = async () => {
    if (form.verticals.value.length > 0) {
      // SAVING ON DB AND UPDATING THE TABLE
      setLoading(true);
      const values = form.verticals.value.map((v: any) => {
        return v.value;
      });
      getRequester()
        .post(`${baseUrl}/api/admin/dashboard/verticals`, {
          name: values,
        })
        .then((response) => {
          setLoading(false);
          // SET UPDATED TABLE ITEMS AND SELECT OPTIONS
          onUpdateOptionsHandler(response.data);
        })
        .catch((err) => {
          setLoading(false);
        });
    } else {
      setForm((prevState: any) => ({
        ...prevState,
        verticals: {
          ...prevState.verticals,
          message: "This field should not be empty",
        },
      }));
    }
    setLoading(false);
  };

  return (
    <div>
      <Wrapper>
        <Heading className="heading">Select Verticals</Heading>
        <div className="fields">
          {renderSelectFields(form, options).map(
            ({ component: Component, ...field }) => {
              return (
                <div key={field.name}>
                  <div className="field-wrapper" key={field.name}>
                    <Component
                      onChange={(e: any) =>
                        onChangeSelectOptions(e, field.name)
                      }
                      {...field}
                    />
                  </div>
                </div>
              );
            }
          )}
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
              onUpdateOptionsHandler={onUpdateOptionsHandler}
              fetchTableData={fetchTableData}
            />
          </div>
        </Loader>
      </Wrapper>
    </div>
  );
};

export default Verticals;
