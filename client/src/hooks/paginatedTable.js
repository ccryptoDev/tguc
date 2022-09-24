import { useState } from "react";
import { errorHandler } from "../utils/errorHandler";

// THIS HOOK IS USED WITH PAGINATATED TALBE THAT CAN BE FOUND IN COMPONENTS/ORGANISMS/TABLE

export const usePaginatedTable = ({ itemsPerPage = 25, api, payload = {} }) => {
  if (typeof api !== "function") throw new Error("you need to provide an api");
  const [page, setPage] = useState(0);
  const [tableData, setTableData] = useState({ items: [], rows: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTable = async (props) => {
    if (typeof api === "function") {
      setLoading(true);
      const result = await api({ ...payload, skip: page, ...props }); // calling the api cb and passing the endpoint query data
      setLoading(false);
      if (result && result.data) {
        const success = errorHandler(result.data);
        if (success && result?.data) {
          setTableData({
            items: result.data.rows,
            total: result.data.totalRows,
            ...result.data,
          });
        } else {
          setTableData({ items: [], rows: [], total: 0 });
        }
      } else {
        setError("something went wrong");
      }
    }
  };

  const onChangePageHandler = (pager) => {
    if (page !== pager.startIndex) {
      setPage(pager.startIndex);
      fetchTable({ skip: pager.startIndex });
    }
  };
  return {
    pagination: {
      itemsPerPage,
      currentPage: page,
      numberOfItems: tableData?.total || 0,
      getPageNumber: onChangePageHandler,
    },
    fetchTable,
    tableData,
    loading,
    error,
  };
};
