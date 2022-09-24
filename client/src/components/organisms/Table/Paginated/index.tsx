import React from "react";
import { TableFooter } from "../../../atoms/Table/Table-paginated";
import Pagination from "../../Pagination";
import PageOfPages from "../../Pagination/PageOfPages";

type IProps = {
  thead: any;
  rows: any;
  pagination: {
    getPageNumber: Function;
    itemsPerPage: number;
    numberOfItems: number;
    currentPage: number;
  };
};

const TableView: React.FC<IProps> = ({
  thead,
  rows,
  pagination: { getPageNumber, numberOfItems, itemsPerPage, currentPage },
}) => {
  const renderTable = () => {
    return (
      <table>
        <thead>{thead}</thead>
        <tbody>{rows}</tbody>
      </table>
    );
  };
  return (
    <>
      <div className="table-wrapper">{renderTable()}</div>
      {numberOfItems > itemsPerPage ? (
        <TableFooter>
          <PageOfPages
            numberOfItems={numberOfItems}
            itemsPerPage={itemsPerPage}
            skip={currentPage}
          />
          <Pagination
            data={{ itemsPerPage, numberOfItems }}
            getPageNumber={getPageNumber}
          />
        </TableFooter>
      ) : (
        ""
      )}
    </>
  );
};
export default TableView;
