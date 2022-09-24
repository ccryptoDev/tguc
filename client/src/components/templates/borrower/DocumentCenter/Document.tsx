import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import downloadIcon from "../../../../assets/svgs/download.svg";
import { urlRegexp } from "../../../../utils/regexp";
import { downloadFile } from "../../../../utils/downloadRemoteFile";

const Wrapper = styled.div`
  background: #fbfbff;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-radius: 16px;
  column-gap: 12px;

  .name {
    font-size: 18px;
    font-weight: 600;
    color: #58595b;
  }

  .size {
    font-size: 14px;
  }

  button {
    background: transparent;
    border: none;
    cursor: pointer;
  }
`;

const Document = ({ name, url }: { name: string; url: string }) => {
  if (!url) {
    return <></>;
  }
  const isRemote = url.match(urlRegexp);

  return (
    <Wrapper>
      <div className="content">
        <div className="name">{name}</div>
      </div>
      {isRemote ? (
        <button
          type="button"
          className="icon"
          onClick={() => downloadFile(url, name)}
        >
          <img src={downloadIcon} alt="download" />
        </button>
      ) : (
        <Link className="icon" to={url} target="_blank" download>
          <img src={downloadIcon} alt="download" />
        </Link>
      )}
    </Wrapper>
  );
};

export default Document;
