import React from "react";
import Select from "../../../../../../../../molecules/Form/Fields/Select/Default";
import { documentOptions } from "../config";

const Table = ({ selectHandler, selectedType }) => {
  return (
    <tr>
      <th>Document Type</th>
      <td>
        <Select
          name="documentType"
          value={selectedType}
          onChange={selectHandler}
          options={documentOptions}
        />
      </td>
    </tr>
  );
};

export default Table;
