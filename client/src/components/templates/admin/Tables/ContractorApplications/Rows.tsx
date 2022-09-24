import React from "react";
import { Link } from "react-router-dom";
import DoneIcon from "@mui/icons-material/Done";
import ClearIcon from "@mui/icons-material/Clear";
import {
  FlexButtons,
  TableCell,
} from "../../../../atoms/Table/Table-paginated";
import { formatDate } from "../../../../../utils/formats";
import { routes } from "../../../../../routes/Admin/routes.config";
import Field from "../../../../molecules/Form/Fields/CompactField";
import EditIcon from "../../../../atoms/Icons/SvgIcons/Upload";
import Modal from "../../../../organisms/Modal/Regular/ModalAndTriggerButton";
import TriggerButton from "../../../../atoms/Buttons/TriggerModal/Trigger-button-edit";
import Form from "../../Forms/WorkCompletion/Form";
import ApproveForm from "../../Forms/ApproveContractorApplication/Approve";
import DenyForm from "../../Forms/DenyContractorApplication/Deny";
import { getAdminRoles } from "../../../../../helpers/index";

const Rows = ({ items = [], role, cb }: any) => {
  const adminRoles = getAdminRoles();
  const isSuperAdmin = role === adminRoles.SuperAdmin;
  if (!items.length) {
    return <></>;
  }
  return items.map(
    ({
      dateCreated = "--",
      email = "--",
      location = "--",
      name = "--",
      status = "--",
      phone = "--",
      screenTrackingId = "",
      loanReference = "",
    }) => {
      return (
        <tr key={screenTrackingId}>
          <td>
            <TableCell minwidth="8rem">
              <Link to={`${routes.LOAN_DETAILS}/${screenTrackingId}`}>
                {loanReference || "View details"}
              </Link>
            </TableCell>
          </td>
          <td>
            <TableCell>
              <Field value={name} />{" "}
            </TableCell>
          </td>
          <td>
            <TableCell>
              <Field value={status} />{" "}
            </TableCell>
          </td>
          <td>
            <TableCell>{formatDate(dateCreated)}</TableCell>
          </td>
          <td>
            <TableCell>{phone}</TableCell>
          </td>
          <td>
            <TableCell>
              <Field value={email} />
            </TableCell>
          </td>
          <td>
            <TableCell minwidth="10rem">{location}</TableCell>
          </td>
          <td>
            <FlexButtons>
              {role?.isMerchant && (
                <>
                  <Modal
                    button={
                      <TriggerButton>
                        Bid <EditIcon />
                      </TriggerButton>
                    }
                    modalContent={Form}
                    state={{ data: { email, phoneNumber: phone } }}
                    modalTitle="Contract Bidding"
                  />
                  <Modal
                    button={
                      <TriggerButton>
                        Work Completion <DoneIcon sx={{ fontSize: "24px" }} />
                      </TriggerButton>
                    }
                    modalContent={Form}
                    state={{ data: { email, phoneNumber: phone } }}
                    modalTitle="Contract Bidding"
                  />
                </>
              )}
              {isSuperAdmin && status === "pending" && (
                <>
                  <Modal
                    button={
                      <TriggerButton>
                        <DoneIcon sx={{ fontSize: "24px" }} />
                      </TriggerButton>
                    }
                    modalContent={ApproveForm}
                    state={{ email, phoneNumber: phone }}
                    cb={cb}
                    modalTitle="Contractor Approval"
                  />
                  <Modal
                    button={
                      <TriggerButton>
                        <ClearIcon sx={{ fontSize: "24px" }} />
                      </TriggerButton>
                    }
                    modalContent={DenyForm}
                    cb={cb}
                    state={{ email, phoneNumber: phone }}
                    modalTitle="Application Denial"
                  />
                </>
              )}
            </FlexButtons>
          </td>
        </tr>
      );
    }
  );
};

export default Rows;
