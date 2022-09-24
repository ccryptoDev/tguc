import React from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { TableCell } from "../../../../../atoms/Table/Table-paginated";
import Field from "../../../../../molecules/Form/Fields/CompactField";
import { routes } from "../../../../../../routes/Admin/routes.config";
import { dateFormat } from "../../../../../../utils/formats";

const Rows = ({ items = [] }: any) => {
  if (!items.length) {
    return <></>;
  }

  return items.map(
    ({
      registerStatus = "",
      createdDate = "--",
      email = "--",
      name = "--",
      phone = "--",
      userReference = "--",
      userId = "",
      id = "",
    }) => {
      return (
        <tr key={id}>
          <td>
            <TableCell minwidth="11rem">
              <Link to={`${routes.USER_DETAILS}/${userId}`}>
                {userReference}
              </Link>
            </TableCell>
          </td>
          <td>
            <TableCell minwidth="15rem">
              <Field value={name} />
            </TableCell>
          </td>
          <td>
            <TableCell>
              <Field value={email} />
            </TableCell>
          </td>
          <td>
            <TableCell>
              <Field value={phone} />
            </TableCell>
          </td>
          <td>
            <TableCell width="14rem">{registerStatus}</TableCell>
          </td>
          <td>
            <TableCell minwidth="11rem">
              {moment(createdDate).utc().format(dateFormat)}
            </TableCell>
          </td>
        </tr>
      );
    }
  );
};

export default Rows;
