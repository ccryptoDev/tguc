import { v4 as uuid } from "uuid";
import { parseFormToFormat } from "../../../../../../utils/form/parsers";

export const parseHttpResponse = (data) => {
  // PARSE THE HTTP RESPONSE TO TABLE FORMAT
  if (Array.isArray(data)) {
    return data.map((item) => {
      return {
        id: uuid(),
        radius: item.radius,
        zipCode: item.zipcode,
        edit: false,
      };
    });
  }
  return null;
};

export const parseTableToFormat = (table) => {
  return table.map((row) => {
    return {
      zipcode: row.zipCode,
      radius: row.radius,
    };
  });
};

export const updateTable = (form, table) => {
  // MERGE FORM DATA TO TABLE DATA
  const parsedForm = parseFormToFormat(form);
  const payload = {
    zipcode: parsedForm.zipCode,
    radius: parsedForm.radius,
  };
  const parsedTable = parseTableToFormat(table);
  return [payload, ...parsedTable];
};

export const validateRepeatingZipCode = (form, table, id) => {
  if (!id) {
    return table.some((row) => row.zipCode === form.zipCode.value);
  }

  // VALIDATE REPEATING ITEMS VALUE IGNORING THE ITEM THAT IS BEING UPDATED
  return table.some(
    (row) => row.zipCode === form.zipCode.value && row.id !== id
  );
};
