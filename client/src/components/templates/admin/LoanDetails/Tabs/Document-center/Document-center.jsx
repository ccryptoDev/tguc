/* eslint no-underscore-dangle:0 */
import React, { useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import UploadDocForm from "./Tables/Upload-documents/Form";
import Heading from "../../../../../molecules/Typography/admin/DetailsHeading";
import UploadedDocuments from "./Tables/UploadedDocuments";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";
import { useFetchDocs } from "../../../../../../hooks/fetchUserDocs";
import { getUserDocsApi } from "../../../../../../api/admin-dashboard";

const DocumentCenter = ({ state }) => {
  const params = useParams();
  const { fetchDocs, docsLoading, docsError, docs } =
    useFetchDocs(getUserDocsApi);

  const fetchDocuments = () => {
    if (params.id) {
      fetchDocs(params.id);
    }
  };

  const documents = useMemo(() => {
    if (docs && docs.agreements) {
      const agreements = docs.agreements.filter(
        (doc) => doc.screenTracking === state?.paymentManagement?.screenTracking
      );
      return { ...docs, agreements };
    }
    return docs;
  }, [docs, state?.paymentManagement]);

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line
  }, [state]);

  return (
    <Loader loading={docsLoading}>
      <Heading text="Financing Agreement Documents" message={docsError} />
      <UploadDocForm fetchDocs={fetchDocuments} state={state} />
      <br />
      <UploadedDocuments
        agreements={documents?.agreements}
        docs={documents?.uploaded}
        fetchDocs={fetchDocuments}
      />
    </Loader>
  );
};

export default DocumentCenter;
