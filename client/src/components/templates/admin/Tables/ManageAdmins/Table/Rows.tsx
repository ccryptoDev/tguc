import React from "react";
import styled from "styled-components";
import { TableCell } from "../../../../../atoms/Table/Table-paginated";
import { formatDate } from "../../../../../../utils/formats";
import EditIcon from "../../../../../atoms/Icons/SvgIcons/Edit";
import Modal from "../../../../../organisms/Modal/Regular/ModalAndTriggerButton";
import TriggerButton from "../../../../../atoms/Buttons/TriggerModal/Trigger-button-edit";
import Form from "../../../Forms/addUpdateUser/UpdateUser";
import Field from "../../../../../molecules/Form/Fields/CompactField";
import { getAdminRoles } from "../../../../../../helpers";

const Button = styled(TriggerButton)`
  padding: 10px;
`;

const Rows = ({ items = [], cb }: any) => {
  if (!items.length) {
    return <></>;
  }

  return items.map(
    ({
      createdDate = "--",
      email = "--",
      location = "--",
      id = "",
      phone = "--",
      userName = "--",
    }) => {
      return (
        <tr key={id}>
          <td>
            <TableCell key={userName} minwidth="8rem">
              <Field value={userName} />
            </TableCell>
          </td>
          <td>
            <TableCell key={email}>
              <Field value={email} />
            </TableCell>
          </td>
          <td>
            <TableCell key={phone}>{phone}</TableCell>
          </td>
          <td>
            <TableCell key={location} minwidth="10rem">
              {location}
            </TableCell>
          </td>
          <td>
            <TableCell key={createdDate} minwidth="8rem">
              {formatDate(createdDate)}
            </TableCell>
          </td>
          <td>
            <Modal
              button={
                <Button>
                  <EditIcon size="16" />
                </Button>
              }
              modalContent={Form}
              state={{
                payload: {
                  email,
                  userName,
                  phoneNumber: phone,
                  id,
                  role: getAdminRoles().SuperAdmin,
                },
              }}
              modalTitle="Update Admin"
              cb={cb}
            />
          </td>
        </tr>
      );
    }
  );
};

export default Rows;
