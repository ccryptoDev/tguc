import React, { useState } from "react";
import { InstntDocumentProcessor } from "@instnt/instnt-react-js";

const frontLicenseSettings = {
  documentType: "License",
  documentSide: "Front",
  frontFocusThreshold: 30,
  frontGlareThreshold: 2.5,
  frontCaptureAttempts: 4,
  captureMode: "Manual",
  overlayTextManual: "Align ID and Tap <br/> to Capture.",
  overlayTextAuto: "Align ID within box and Hold",
  overlayColor: "yellow",
  enableFaceDetection: true,
  setManualTimeout: 8,
  backFocusThreshold: 30,
  backGlareThreshold: 2.5,
  backCaptureAttempts: 4,
  isBarcodeDetectedEnabled: false,
  enableLocationDetection: false,
};

const backLicenseSettings = { ...frontLicenseSettings };
backLicenseSettings.documentSide = "Back";

const selfieSettings = {
  enableFarSelfie: true,
  selfieCaptureAttempt: 4,
  captureMode: "Auto",
  compressionType: "JPEG",
  compressionQuality: "50",
  useBackCamera: false,
  overlayText: "Align Face and Tap button</br> to Capture.",
  overlayTextAuto: "Align Face and Hold",
  overlayColor: "#808080",
  orientationErrorText:
    "Landscape orientation is not supported. Kindly rotate your device to Portrait orientation.",
  enableFaceDetection: true,
  setManualTimeout: 8,
  enableLocationDetection: false,
};

const Component = () => {
  const [side, setSide] = useState("front");
  return (
    <div>
      {side === "front" ? (
        <InstntDocumentProcessor documentSettings={frontLicenseSettings} />
      ) : (
        <InstntDocumentProcessor documentSettings={backLicenseSettings} />
      )}
    </div>
  );
};

export default Component;
