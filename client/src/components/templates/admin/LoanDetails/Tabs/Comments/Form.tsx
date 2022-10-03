import React, { useState } from "react";
import styled from "styled-components";
import Table from "../../../../../atoms/Table/Details-vertical";
import TextField from "../../../../../molecules/Form/Fields/TextField";
import TextArea from "../../../../../molecules/Form/Fields/TextArea";
import Buttons from "../../../../../molecules/Buttons/ButtonsWrapper";
import Button from "../../../../../atoms/Buttons/Button";
import { postCommentApi } from "../../../../../../api/admin-dashboard";
import { initForm } from "./config";
import { validateComment } from "./validate";
import { useUserData } from "../../../../../../contexts/admin";
import { parseFormToFormat } from "../../../../../../utils/form/parsers";

const Styled = styled.div`
  table {
    width: 100%;
    max-width: 700px;
  }
  td,
  th {
    padding: 0;
  }
  th {
    vertical-align: text-bottom;
    width: 100px;
    & .heading {
      padding: 1rem;
      font-weight: bold;
    }
  }

  textarea {
    resize: none;
  }

  .input-wrapper {
    padding: 1rem 1rem 3rem 1rem;
  }

  .submit-btn-wrapper {
    margin: 0;
    padding: 1rem;
    & button {
      width: max(20rem, 50%);
    }
  }
`;

const CommentComponent = ({
  getComments,
  screenTrackingId,
  setLoading,
}: any) => {
  const { user } = useUserData();
  const [form, setForm] = useState(initForm());
  const adminId = user?.user?.data?.userId;
  const onChangeHandler = (e: any) => {
    setForm((prevState: any) => ({
      ...prevState,
      [e.target.name]: {
        ...prevState[e.target.name],
        value: e.target.value,
        message: "",
      },
    }));
  };

  const onSubmitHandler = async (e: any) => {
    e.preventDefault();
    const [isValid, updatedForm] = validateComment(form);
    if (isValid && adminId && screenTrackingId) {
      const { subject, comment } = parseFormToFormat(updatedForm);
      const body = {
        screenTrackingId,
        subject,
        comment,
        createdBy: user?.user?.data?.email,
      };
      setLoading(true);
      const result: any = await postCommentApi(body);
      setLoading(false);
      if (result && !result.error && result.data) {
        getComments();
        setForm(initForm());
      }
    } else {
      setForm(updatedForm);
    }
  };

  return (
    <Styled>
      <form onSubmit={onSubmitHandler}>
        <Table>
          <tbody>
            <tr>
              <th>
                <div className="heading">Subject</div>
              </th>
              <td>
                <div className="input-wrapper">
                  <TextField
                    name="subject"
                    message={form.subject.message}
                    value={form.subject.value}
                    placeholder="Enter subject"
                    onChange={onChangeHandler}
                  />
                </div>
              </td>
            </tr>
            <tr>
              <th>
                <div className="heading">Comment</div>
              </th>
              <td>
                <div className="input-wrapper">
                  <TextArea
                    name="comment"
                    message={form.comment.message}
                    value={form.comment.value}
                    cols={30}
                    rows={10}
                    onChange={onChangeHandler}
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td />
              <td>
                <Buttons className="submit-btn-wrapper">
                  <Button type="submit" variant="contained">
                    Submit
                  </Button>
                </Buttons>
              </td>
            </tr>
          </tbody>
        </Table>
      </form>
    </Styled>
  );
};

export default CommentComponent;
