import React from "react";
import styled from "styled-components";
import { formatDate } from "../../../../../../../../utils/formats";
import DocumentLinks from "./ActionButtons/Document";
import Actions from "./ActionButtons/Actions";

const Tr = styled.tr`
  & a {
    color: var(--color-blue-1);
    text-decoration: none;
  }
`;

const Rows = ({ items = [], agreements = [], cb }: any) => {
  const signedDocs = agreements.map(({ type, s3link }: any, index: number) => {
    return (
      <Tr key={s3link}>
        <td style={{ width: "10%" }}>{index + 1}</td>
        <td style={{ width: "20%" }}>{type}</td>
        <td>
          <DocumentLinks document={s3link} />
        </td>
      </Tr>
    );
  });
  const uploadedDocuments = items.map(
    (
      {
        driversLicense,
        document,
        type,
        uploaderName = "--",
        createdAt = "--",
        status,
        id,
        reason,
      }: any,
      index: number
    ) => {
      const license =
        driversLicense?.front && driversLicense?.back
          ? [driversLicense?.front, driversLicense?.back]
          : [];
      return (
        <Tr key={id}>
          <td style={{ width: "10%" }}>{index + 1}</td>
          <td style={{ width: "20%" }}>{type}</td>
          <td>
            <DocumentLinks document={document} license={license} />
          </td>
          <td style={{ width: "20%" }}>{uploaderName}</td>
          <td style={{ width: "30%" }}>{formatDate(createdAt)}</td>
          <td style={{ width: "25%" }}>
            <Actions
              reason={reason}
              status={status}
              documentId={id}
              type={type}
              updateTable={cb}
            />
          </td>
        </Tr>
      );
    }
  );

  return (
    <>
      {signedDocs}
      {uploadedDocuments}
    </>
  );
};

export default Rows;
