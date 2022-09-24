import React from "react";
import styled from "styled-components";
import WarningIcon from "@mui/icons-material/ErrorOutlineOutlined";
import ActionButton from "../../../../../../molecules/Buttons/ActionButton";
import FormattedField from "../../../../../../molecules/Form/Fields/FormattedField";

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
  display: flex;
  width: 300px;

  .value {
    height: 28px;
    display: flex;
    align-items: center;
    padding-left: 17px;
    max-width: 200px;
  }

  .textField {
    & input {
      padding: 10px 16px;
    }

    & .error {
      position: absolute;
      top: 100%;
      margin: 2px;
    }
  }
`;

const Row = ({
  rows,
  onRemoveItemHandler,
  onEditHandler,
  onUpdateTableHandler,
  onCancelHandler,
  onChange,
  form,
  updatingItem,
}) => {
  return rows.map((item) => {
    const loading = updatingItem.loading && updatingItem.id === item.id;
    return (
      <tr key={item.id}>
        <td>
          {item.edit ? (
            <TableCell className="cell">
              <FormattedField
                onChange={onChange}
                name="zipCode"
                value={form?.zipCode.value}
                message={form.zipCode.message}
              />
            </TableCell>
          ) : (
            <TableCell className="cell">
              <div className="value">{item.zipCode}</div>
            </TableCell>
          )}
        </td>
        <td>
          {item.edit ? (
            <TableCell className="cell">
              <FormattedField
                onChange={onChange}
                message={form.radius.message}
                name="radius"
                value={form?.radius.value}
              />
            </TableCell>
          ) : (
            <TableCell className="cell">
              <div className="value">{item.radius}</div>
            </TableCell>
          )}
        </td>
        <td>
          <TableCell>
            {item.edit ? (
              <ButtonsWrapper>
                <ActionButton
                  type="save"
                  loading={loading}
                  onClick={() => onUpdateTableHandler(item.id)}
                />
                <ActionButton
                  type="cancel"
                  onClick={() => onCancelHandler(item.id)}
                />
              </ButtonsWrapper>
            ) : (
              <ButtonsWrapper>
                <ActionButton
                  type="edit"
                  onClick={() => onEditHandler(item.id)}
                />
                <ActionButton
                  type="delete"
                  loading={loading}
                  onClick={() => onRemoveItemHandler(item.id)}
                />
              </ButtonsWrapper>
            )}
          </TableCell>
        </td>
      </tr>
    );
  });
};

export default Row;
