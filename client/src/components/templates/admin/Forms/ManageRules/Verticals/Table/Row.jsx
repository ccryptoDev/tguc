import React from "react";
import styled from "styled-components";
import ActionButton from "../../../../../../molecules/Buttons/ActionButton";

const ButtonsWrapper = styled.div`
  display: flex;
  position: relative;
  column-gap: 10px;
  button {
    width: 40px;
  }

  .loading {
    opacity: 0.5;
  }
`;

const TableCell = styled.div`
  padding: 0 16px;

  .list {
    line-height: 1.5;
  }
`;

const Row = ({ rows, onRemoveItemHandler, updatingItem }) => {
  return rows.map((item) => {
    const loading = updatingItem.loading && updatingItem.id === item.id;
    return (
      <tr key={item.id}>
        <td>
          <TableCell className="cell">
            <div className="list">{item.name}</div>
          </TableCell>
        </td>
        <td>
          <TableCell>
            <ButtonsWrapper>
              <ActionButton
                type="delete"
                loading={loading}
                onClick={() => onRemoveItemHandler(item.id)}
              />
            </ButtonsWrapper>
          </TableCell>
        </td>
      </tr>
    );
  });
};

export default Row;
