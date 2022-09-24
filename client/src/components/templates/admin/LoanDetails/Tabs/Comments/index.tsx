import React, { useState, useEffect } from "react";
import Heading from "../../../../../molecules/Typography/admin/DetailsHeading";
import Form from "./Form";
import Table from "./Table";
import { fetchCommentsApi } from "../../../../../../api/admin-dashboard";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";
import ErrorMessage from "../../../../../molecules/Form/Elements/FormError";

const Comments = ({ state }: { state: any }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const screenTrackingId = state?.screenTracking?.id;

  const getComments = async () => {
    setLoading(true);
    const result: any = await fetchCommentsApi(screenTrackingId);
    setLoading(false);
    if (result && !result.error) {
      setComments(result?.data?.items);
    } else if (result.error) {
      setError("something went wrong");
    }
  };

  useEffect(() => {
    getComments();
  }, []);

  return (
    <div>
      <Heading text="Comments Section" />
      <Form
        getComments={getComments}
        screenTrackingId={screenTrackingId}
        setLoading={setLoading}
      />
      {comments.length > 0 ? (
        <>
          <Heading text="Comments Details" />
          <ErrorMessage message={error} />
          <Loader loading={loading}>
            <Table comments={comments} />{" "}
          </Loader>
        </>
      ) : (
        ""
      )}
    </div>
  );
};

export default Comments;
