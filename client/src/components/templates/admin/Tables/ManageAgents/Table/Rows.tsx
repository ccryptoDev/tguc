import React, { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import styled from "styled-components";
import EditIcon from "../../../../../atoms/Icons/SvgIcons/Edit";
import { TableCell } from "../../../../../atoms/Table/Table-paginated";
import { formatDate } from "../../../../../../utils/formats";
import Modal from "../../../../../organisms/Modal/Regular/ModalAndTriggerButton";
import TriggerButton from "../../../../../atoms/Buttons/TriggerModal/Trigger-button-edit";
import Form from "../../../Forms/addUpdateUser/UpdateUser";
import Field from "../../../../../molecules/Form/Fields/CompactField";
import DisableAgentForm from "../../../Forms/Agents/DisableAgentForm";
import { getAdminData, getAdminRoles } from "../../../../../../helpers";

const ButtonsWrapper = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Button = styled(TriggerButton)`
  padding: 10px;
`;

const Rows = ({ items = [], cb }: any) => {
  const adminData = getAdminData();
  const adminRoles = getAdminRoles();
  const [itemsList, setItemsList] = useState([]);

  useEffect(() => {
    if (items.length > 0) {
      setItemsList(items);
    }
  }, [items]);
  if (!itemsList.length) {
    return <></>;
  }

  return itemsList.map(
    ({
      createdDate = "--",
      email = "--",
      contractor = "--",
      agentReference = "--",
      id = "",
      phone = "--",
      userName = "--",
    }) => {
      return (
        <tr key={id}>
          <td>
            <TableCell minwidth="8rem">
              <Field value={userName} />
            </TableCell>
          </td>
          <td>
            <TableCell>
              <Field value={email} />
            </TableCell>
          </td>
          <td>
            <TableCell>{phone}</TableCell>
          </td>
          {adminData && adminData.role === adminRoles.SuperAdmin && (
            <td>
              <TableCell>{contractor}</TableCell>
            </td>
          )}
          <td>
            <TableCell minwidth="10rem">{agentReference}</TableCell>
          </td>
          <td>
            <TableCell minwidth="8rem">{formatDate(createdDate)}</TableCell>
          </td>
          <td>
            <ButtonsWrapper>
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
                    role: getAdminRoles().MerchantStaff,
                  },
                }}
                modalTitle="Update Agent"
                cb={cb}
              />
              <Modal
                button={
                  <Button>
                    <DeleteIcon sx={{ fontSize: "24px" }} />
                  </Button>
                }
                modalContent={DisableAgentForm}
                state={{ data: { id } }}
                modalTitle="Disable Agent"
                cb={cb}
              />
            </ButtonsWrapper>
          </td>
        </tr>
      );
    }
  );
};

export default Rows;
