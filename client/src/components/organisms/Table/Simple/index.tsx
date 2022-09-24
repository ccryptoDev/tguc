import React, { useEffect } from "react";
import Table from "../Paginated";
import { usePaginatedTable } from "../../../../hooks/paginatedTable";
import Loader from "../../../molecules/Loaders/LoaderWrapper";

const SimpleTable = ({ rows: Rows, thead: Thead, api }: any) => {
  const { tableData, loading, fetchTable, pagination } = usePaginatedTable({
    api,
    payload: { page: 1, perPage: 25 },
  });

  useEffect(() => {
    fetchTable();
  }, []);

  return (
    <div>
      <Loader loading={loading}>
        <Table
          rows={<Rows items={tableData?.items} cb={fetchTable} />}
          thead={<Thead />}
          pagination={pagination}
        />
      </Loader>
    </div>
  );
};

export default SimpleTable;
