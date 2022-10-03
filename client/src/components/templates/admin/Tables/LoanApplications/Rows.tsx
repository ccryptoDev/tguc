import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DoneIcon from "@mui/icons-material/Done";
import MoneyIcon from "@mui/icons-material/AttachMoney";
import ClearIcon from "@mui/icons-material/Clear";
import { cloneDeep, findIndex } from "lodash";
import {
  FlexButtons,
  TableCell,
} from "../../../../atoms/Table/Table-paginated";
import { formatDate, formatCurrency } from "../../../../../utils/formats";
import { routes } from "../../../../../routes/Admin/routes.config";
import Field from "../../../../molecules/Form/Fields/CompactField";
import Modal from "../../../../organisms/Modal/Regular/ModalAndTriggerButton";
import TriggerButton from "../../../../atoms/Buttons/TriggerModal/Trigger-button-edit";
import Form from "../../Forms/Bid/UpdateUser";
import WorkCompletionForm from "../../Forms/WorkCompletion/Form";
import ApproveForm from "../../Forms/ApproveApplication/Approve";
import DenyApplicationForm from "../../Forms/DenyApplication/Deny";
import { getAdminRoles } from "../../../../../helpers";

const adminRoles = getAdminRoles();
const Rows = ({ items = [], role, cb }: any) => {
  const [itemsList, setItemsList] = useState<any>([]);
  useEffect(() => {
    setItemsList(items);
  }, [items]);
  if (!itemsList.length) {
    return <></>;
  }

  const callback = () => {
    cb();
  };
  return itemsList.map(
    ({
      dateCreated = "--",
      email = "--",
      contractorReference = "",
      practiceName = "",
      name = "--",
      status = "--",
      phone = "--",
      screenTrackingId = "",
      loanReference = "",
      selectedAmount = "",
      isAwaitingWorkCompletion = false,
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
            <TableCell>{formatCurrency(selectedAmount)} </TableCell>
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
            <TableCell minwidth="10rem">{contractorReference}</TableCell>
          </td>
          <td>
            <TableCell minwidth="10rem">{practiceName}</TableCell>
          </td>
          <td>
            <FlexButtons>
              {role && role === adminRoles.Merchant && status === "approved" && (
                <>
                  {isAwaitingWorkCompletion === true && <p /> ? (
                    <p>Work Completion Requested</p>
                  ) : (
                    <>
                      <Modal
                        button={
                          <TriggerButton>
                            Bid <MoneyIcon sx={{ fontSize: "24px" }} />
                          </TriggerButton>
                        }
                        modalContent={Form}
                        state={{ data: { email, phoneNumber: phone } }}
                        modalTitle="Contract Bidding"
                      />
                      <Modal
                        button={
                          <TriggerButton>
                            Work Completion
                            <DoneIcon sx={{ fontSize: "24px" }} />
                          </TriggerButton>
                        }
                        modalContent={WorkCompletionForm}
                        state={{
                          data: {
                            email,
                            phoneNumber: phone,
                            screenTrackingId,
                          },
                        }}
                        modalTitle="Request Work Completion"
                      />
                    </>
                  )}
                </>
              )}
              {role && role === adminRoles.SuperAdmin && status === "pending" && (
                <>
                  <Modal
                    button={
                      <TriggerButton>
                        <DoneIcon sx={{ fontSize: "24px" }} />
                      </TriggerButton>
                    }
                    modalContent={ApproveForm}
                    state={{ id: screenTrackingId }}
                    modalTitle="Application Approval"
                    cb={callback}
                  />
                  <Modal
                    button={
                      <TriggerButton>
                        <ClearIcon sx={{ fontSize: "24px" }} />
                      </TriggerButton>
                    }
                    modalContent={DenyApplicationForm}
                    state={{ id: screenTrackingId }}
                    modalTitle="Application Denial"
                    cb={callback}
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
