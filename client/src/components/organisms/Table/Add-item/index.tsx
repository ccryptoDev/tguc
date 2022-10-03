import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { TableProvider } from "../../../../contexts/Table/table";
import Table from "../Paginated";
import SearchField from "../../../molecules/Search/TableSearch";
import { IProps } from "./types";
import { usePaginatedTable } from "../../../../hooks/paginatedTable";
import { AdminTableWrapper } from "../../../atoms/Table/Table-paginated";
import Loader from "../../../molecules/Loaders/LoaderWrapper";
import Modal from "../../Modal/Regular/ModalAndTriggerButton";
import TriggerButton from "../../../atoms/Buttons/TriggerModal/Trigger-button-default";

const Navigation = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 2rem 1rem;
`;

const TableControls = ({
  rows: Rows,
  thead: Thead,
  form: Form,
  modalTitle = "",
  api,
  isButtonShown = true,
  ...props
}: IProps) => {
  const [search, setSearch] = useState<string>("");
  const { tableData, loading, fetchTable, pagination } = usePaginatedTable({
    api,
    payload: { search, page: 1, perPage: 25 },
  });

  useEffect(() => {
    fetchTable({ search });
  }, [search]);

  const searchHandler = (value: string) => setSearch(value);

  return (
    <div>
      <Navigation>
        {isButtonShown ? (
          <Modal
            button={<TriggerButton>{modalTitle}</TriggerButton>}
            state={{ payload: { isAgent: false, ...props } }}
            modalContent={Form}
            modalTitle={modalTitle}
            cb={() => fetchTable({ search })}
          />
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
                cb={() => fetchTable({ search })}
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
