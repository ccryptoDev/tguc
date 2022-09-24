import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { TableProvider } from "../../../../contexts/Table/table";
import Table from "../Paginated";
import Filters from "../../../molecules/Table/Elements/Filters";
import SearchField from "../../../molecules/Search/TableSearch";
import { IfiltersInit, IProps } from "./types";
import { usePaginatedTable } from "../../../../hooks/paginatedTable";
import { AdminTableWrapper } from "../../../atoms/Table/Table-paginated";
import Loader from "../../../molecules/Loaders/LoaderWrapper";
import { useUserData } from "../../../../contexts/admin";

const Navigation = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 2rem 1rem;
`;

const TableControls = ({
  filtersInit = [],
  rows: Rows,
  thead: Thead,
  activeFilter,
  initStatus = "",
  api,
}: IProps) => {
  const { user } = useUserData();
  const role = user?.user?.data?.roleName;
  const [status, setStatus] = useState<string | string[]>(initStatus);
  const [filters, setFilters] = useState<IfiltersInit>([...filtersInit]);
  const [search, setSearch] = useState<string>("");
  const { tableData, loading, fetchTable, pagination } = usePaginatedTable({
    api,
    payload: { search, page: 1, perPage: 25, status: initStatus },
  });

  useEffect(() => {
    fetchTable({ search, status });
  }, [search, status]);

  // TABLE FILTERS
  const filterHandler = (clickedTabName: string) => {
    // HIGHTLIGHT THE ACTIVE TAB
    const updatedFilters = filters.map((item) =>
      item.name === clickedTabName
        ? { ...item, active: true }
        : { ...item, active: false }
    );
    // SEE IF THE CURRENT STATUS HAS CHANGED
    const updatedStatus = updatedFilters.find((item) => item.active);
    if (updatedStatus?.status && status !== updatedStatus?.status) {
      setStatus(updatedStatus?.status);
    }
    // SET A CALLBACK TO SHOW WHICH FILTER IS SELECTED
    setFilters(updatedFilters);
    if (typeof activeFilter === "function") {
      activeFilter(updatedFilters);
    }
  };

  const searchHandler = (value: string) => setSearch(value);

  return (
    <div>
      <Navigation>
        {filters.length ? (
          <Filters items={filters} filterHandler={filterHandler} />
        ) : (
          <div />
        )}
        <SearchField searchHandler={searchHandler} />
      </Navigation>
      <Loader loading={loading}>
        <AdminTableWrapper>
          <Table
            rows={
              <Rows
                items={tableData?.items}
                role={role}
                cb={() => fetchTable({ search, status })}
              />
            }
            thead={<Thead />}
            pagination={pagination}
          />
        </AdminTableWrapper>
      </Loader>
    </div>
  );
};

export default TableControls;
