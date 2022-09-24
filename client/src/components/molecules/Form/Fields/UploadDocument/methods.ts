import { v4 as uuidv4 } from "uuid";
import { getBase64 } from "../../../../../utils/base64";

// READ A FILE VALUE FROM INPUT FIELD
export const add = (e: any) => {
  const newDocuments: any[] = [];
  const newFiles = Array.from(e.target.files);
  newFiles.forEach((file: any, index: number) => {
    newDocuments[index] = file;
    newDocuments[index].id = uuidv4();
  });
  e.target.value = "";
  return newDocuments;
};

// REMOVE A FILE FROM FORM
export const remove = ({ id, files }: { files: any[]; id: string }) => {
  if (files && files?.length) {
    const updatedList: any = files?.filter((item: any) => item.id !== id);
    return updatedList;
  }

  return files;
};

// SET A LIMIT OF FILES THAT CAN BE UPLOADED PER INPUT
export const applyLimit = ({
  array = [],
  limit = 1,
}: {
  array: any[];
  limit: number;
}) => {
  return array.slice(0, limit);
};

// PARSE AN INPUT FILE TO NEW OBJECT WITH FILE VALUE CONVERTED TO BASE64 STRING
export const parseFilesToStrings = async (files: any[]) => {
  return Promise.all(
    files.map(async (file) => {
      const base64String = await getBase64(file);
      return { label: file.name, value: base64String, id: file.id };
    })
  );
};

// PARSE FORM OF FILES TO REQUEST BODY
// {insurance: [ {label: string, value: string, id: string} ]}
export const parseDocumentsFormToRequestBody = async (files: any) => {
  const docs: any = {};
  await Promise.all(
    Object.keys(files).map(async (key) => {
      const res = await parseFilesToStrings(files[key].value);
      docs[key] = res;
    })
  );

  return docs;
};
