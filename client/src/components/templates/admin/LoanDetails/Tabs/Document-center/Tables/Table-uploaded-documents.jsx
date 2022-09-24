import React from "react";
import DoneIcon from "@mui/icons-material/Done";
import DoDisturb from "@mui/icons-material/DoDisturb";
import styled from "styled-components";
import Wrapper from "../../../../../../atoms/Table/Details-horizontal";
import { formatDate } from "../../../../../../../utils/formats";
import { updateDocumentStatus } from "../../../../../../../api/admin-dashboard";
import Modal from "../../../../../../organisms/Modal/Regular/ModalAndTriggerButton";
import TriggerButton from "../../../../../../atoms/Buttons/TriggerModal/Trigger-button-edit";
import Select from "../../../../../../molecules/Form/Fields/Select/Default";

const Icon = styled.button`
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
`;
const Form = styled.form`
    padding: 2rem 2rem;
    max-width: 600px;
    box-sizing: border-box;
    .layout {
      position: relative;
      display: grid;
      grid-template-columns: 2fr 2fr;
      grid-gap: 2rem;
      margin-bottom: 4rem;
      & .textField:nth-child(1),
      & .textField:nth-child(4) {
        grid-column: 1/-1;
      }
    }
    }
  `;

const options = (docType) => [
  { value: "", label: "Select Document Type", id: "1" },
  { value: `Missing ${docType}`, label: `Missing ${docType}`, id: "2" },
  { value: `Unreadable ${docType}`, label: "Unreadable Document", id: "3" },
  { value: `Expired ${docType}`, label: "Expired Document", id: "4" },
  { value: `Incomplete ${docType}`, label: "Incomplete Document", id: "5" },
  { value: "Other", label: "Other Reason", id: "5" },
];

const Table = ({ docs = [] }) => {
  let denyReason = null;
  const getUrlExtension = (url) => {
    const filename = url.substring(url.lastIndexOf("/") + 1);
    return filename;
  };
  const onDenyHandler = async (e, documentId) => {
    e.preventDefault();
    if (denyReason !== null && denyReason !== "") {
      const reason = String(e.target.form[0].value) || null;
      const updateDoc = await updateDocumentStatus(
        documentId,
        "denied",
        reason
      );
      if (updateDoc?.data?.affected > 0) {
        alert(`Documment denied. Reason: ${reason}`);
      }
    } else {
      alert("Select a Deny Reason");
    }
  };
  const onChange = (e) => {
    denyReason = e.target.value; // we're not using React.useState here because crashes and an Effect will be too much
  };

  const ModalContent = ({ state, closeModal }) => {
    const docId = state?.data?.documentId;
    const docType = state?.data?.documentType;
    return (
      <div>
        <Form>
          <div className="layout">
            <div>
              <Select onChange={onChange} options={options(docType)} />
            </div>
            <br />
            <button type="submit" onClick={onDenyHandler}>
              Save
            </button>
            <button type="button" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </Form>
      </div>
    );
  };
  const approveBtn = async (e, documentId) => {
    e.preventDefault();
    const updateDoc = await updateDocumentStatus(documentId, "approved");
    if (updateDoc?.data?.affected > 0) {
      alert("Documment Approved");
    }
  };

  const printImage = (url) => {
    const win = window.open("");
    win.document.write(
      `<img src="${url}" onload="window.print();window.close()" />`
    );
    win.focus();
  };

  const printBtn = (doc) => {
    return printImage(doc);
  };
  return (
    <Wrapper>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Document Type</th>
            <th>Document</th>
            <th>Uploaded By </th>
            <th>Uploaded date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {docs.map(
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
              },
              index
            ) => {
              return (
                <tr key={driversLicense}>
                  <td style={{ width: "10%" }}>{index + 1}</td>
                  <td style={{ width: "20%" }}>{type}</td>
                  <td style={{ width: "20%" }}>
                    {driversLicense ? (
                      <p>
                        <a
                          href={driversLicense.front}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View Document
                        </a>
                        <p />
                        <a
                          href={driversLicense.front}
                          target="_blank"
                          rel="noreferrer"
                          download={`licence-${getUrlExtension(
                            driversLicense.front
                          )}`}
                          title={getUrlExtension(driversLicense.front)}
                        >
                          Download
                        </a>
                        <p>
                          <button
                            type="button"
                            onClick={(e) => printBtn(driversLicense.front)}
                          >
                            Print
                          </button>
                        </p>
                        <br />
                        <br />
                        <a
                          href={driversLicense.back}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View Document
                        </a>
                        <p />
                        <a
                          href={driversLicense.back}
                          download={`licence-${getUrlExtension(
                            driversLicense.back
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          title={getUrlExtension(driversLicense.back)}
                        >
                          Download
                        </a>
                        <p>
                          <button
                            type="button"
                            onClick={(e) => printBtn(driversLicense.back)}
                          >
                            Print
                          </button>
                        </p>
                      </p>
                    ) : (
                      <div>
                        <a href={document} target="_blank" rel="noreferrer">
                          View Document
                        </a>
                        <p> </p>
                        <a
                          href={document}
                          download={getUrlExtension(document)}
                          target="_blank"
                          rel="noreferrer"
                          title={getUrlExtension(document)}
                        >
                          Download
                        </a>
                        <p>
                          <button
                            type="button"
                            onClick={(e) => printBtn(document)}
                          >
                            Print
                          </button>
                        </p>
                      </div>
                    )}
                    <br />
                    <br />
                  </td>
                  <td style={{ width: "20%" }}>{uploaderName}</td>
                  <td style={{ width: "30%" }}>{formatDate(createdAt)}</td>
                  <td style={{ width: "25%" }}>
                    {status && status === "pending" && (
                      <div>
                        <Icon
                          type="submit"
                          className="btn"
                          onClick={(e) => approveBtn(e, id)}
                        >
                          <DoneIcon sx={{ fontSize: "24px" }} />
                        </Icon>
                        <Modal
                          button={
                            <TriggerButton>
                              <DoDisturb sx={{ fontSize: "24px" }} />
                            </TriggerButton>
                          }
                          modalContent={ModalContent}
                          state={{
                            data: {
                              documentId: id,
                              documentType: type,
                            },
                          }}
                          modalTitle="Deny document"
                        />
                      </div>
                    )}
                    {status && status === "approved" && "approved" && (
                      <div>Approved</div>
                    )}
                    {status && status === "denied" && "denied" && (
                      <div>Denied. {reason}</div>
                    )}
                  </td>
                </tr>
              );
            }
          )}
        </tbody>
      </table>
    </Wrapper>
  );
};

export default Table;
