import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { toast } from "react-toastify";
import baseUrl from "../../../../../../app.config";
import Heading from "../../../../../molecules/Typography/admin/DetailsHeading";
import { Amount } from "./Types/Amount";
import { Transaction } from "./Types/Transaction";
import Button from "../../../../../atoms/Buttons/Button";
import AmountListingTable from "./Tables/AmountListingTable";
import TransactionsTable from "./Tables/TransactionsTable";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";

const Container = styled.div`
  font-size: 1.4rem;
  line-height: 3rem;
  h2 {
    margin-top: 1rem;
  }
  .flex-between {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    tr {
      width: 100%;
      th,
      td {
        border-bottom: 1px solid var(--color-border);
        text-align: left;
        padding: 8px;
        font-size: 1.4rem;
        &.half {
          width: 50%;
        }
        &.no-wrap {
          white-space: nowrap;
        }
      }
      th {
        font-weight: bold;
      }
    }
  }
`;

type PlaidData = {
  startDate?: string;
  endDate?: string;
  incomes?: Amount[];
  expenses?: Amount[];
  transactions?: Transaction[];
};

const Plaid = ({ state = {} }: any) => {
  const initialState: PlaidData = {};
  const [isLoading, setIsLoading] = useState(false);
  const [isBtnLoading, setIsBtnLoading] = useState(false);
  const [token, setToken] = useState("");
  const [plaidData, setPlaidData] = useState(initialState);

  const fetchPlaidReport = () => {
    setIsBtnLoading(true);
    axios
      .get(`${baseUrl}/api/plaid/plaid-report/${state.user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      })
      .then((response) => {
        setIsBtnLoading(false);
        console.log(response);
        if (response.data) {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "report.pdf");
          document.body.appendChild(link);
          link.click();
        } else {
          toast.error(`Server is busy at the moment, Please try again latter`);
        }
      })
      .catch((err) => {
        setIsBtnLoading(false);
        console.log(err);
      });
  };

  const fetchPlaidTransactions = (id: string) => {
    if (Object.keys(plaidData).length === 0) {
      setIsLoading(true);
    }
    axios
      .post(`${baseUrl}/api/plaid/transactionsList/${id}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        setPlaidData(response.data);
      })
      .catch((err) => {
        setIsLoading(false);
        console.log(err);
      });
  };

  useEffect(() => {
    let isSubscribed = true;
    if (isSubscribed && token) {
      const user = state?.user;
      fetchPlaidTransactions(user.id);
    }
    return () => {
      isSubscribed = false;
    };
  }, [token]);

  useEffect(() => {
    let isSubscribed = true;
    if (isSubscribed) {
      const JWT = localStorage.getItem("adminToken");
      if (!JWT) {
        throw new Error("adminToken was not found in localStorage.");
      }
      setToken(JSON.parse(JWT).token);
    }
    return () => {
      isSubscribed = false;
    };
  }, []);
  return (
    <Loader loading={isLoading}>
      <Heading text="Plaid Data" />
      {Object.keys(plaidData).length > 0 && !isLoading && (
        <Container>
          <div className="flex-between">
            <p>Range: {`${plaidData.startDate} - ${plaidData.endDate}`}</p>
            <Button
              variant="contained"
              onClick={fetchPlaidReport}
              disabled={isBtnLoading}
            >
              Plaid Report
            </Button>
          </div>
          <h2>Incomes</h2>
          {plaidData.incomes && (
            <AmountListingTable items={plaidData.incomes} />
          )}
          <h2>Expenses</h2>
          {plaidData.expenses && (
            <AmountListingTable items={plaidData.expenses} />
          )}
          <h2>Transactions</h2>
          {plaidData.transactions && (
            <TransactionsTable transactions={plaidData.transactions} />
          )}
        </Container>
      )}
    </Loader>
  );
};
export default Plaid;
