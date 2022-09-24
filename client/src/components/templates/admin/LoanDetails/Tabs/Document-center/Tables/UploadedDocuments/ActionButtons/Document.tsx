import React, { useState } from "react";
import styled from "styled-components";
import DownLoadIcon from "@mui/icons-material/FileDownloadOutlined";
import { downloadFile } from "../../../../../../../../../utils/downloadRemoteFile";

const Wrapper = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  width: 290px;
  justify-content: space-between;
`;

const Button = styled.button`
  border: 1px solid var(--color-border);
  background: #fff;
  padding: 6px;

  display: flex;
  gap: 5px;
`;
const getUrlExtension = (url: string) => {
  const filename = url?.substring(url?.lastIndexOf("/") + 1);
  return filename;
};

const printImage = (url: string) => {
  const win: any = window.open("");
  win.document.write(
    `<img src="${url}" onload="window.print();window.close()" />`
  );
  win.focus();
};

const printBtn = (doc: any) => {
  return printImage(doc);
};

const Links = ({ url }: any) => {
  const fileName = getUrlExtension(url);
  return (
    <ButtonsWrapper>
      <a href={url} target="_blank" rel="noreferrer">
        View Document
      </a>
      <Button type="button" onClick={() => downloadFile(url, fileName)}>
        Download <DownLoadIcon />
      </Button>
      <Button type="button" onClick={() => printBtn(url)}>
        Print
      </Button>
    </ButtonsWrapper>
  );
};

const DocumentLinks = ({ license, document }: any) => {
  return (
    <Wrapper>
      {license.length ? (
        license.map((url: any) => {
          return (
            <div key={url}>
              <Links url={url} />
            </div>
          );
        })
      ) : (
        <Links url={document} />
      )}
    </Wrapper>
  );
};

export default DocumentLinks;
