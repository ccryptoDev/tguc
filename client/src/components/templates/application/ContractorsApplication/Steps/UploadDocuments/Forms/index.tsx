import React from "react";
import { BrowserView, MobileView } from "react-device-detect";
import FileUpload from "./UploadSystemImages";
// import UploadCameraImages from "./UploadCameraImages";

const UploadFiles = (props: any) => {
  return (
    <div>
      <BrowserView>
        <FileUpload {...props} />
      </BrowserView>
      <MobileView>{/* <UploadCameraImages {...props} /> */}</MobileView>
    </div>
  );
};

export default UploadFiles;
