import React, { useState, useRef, useEffect } from "react";
import { InstntSignupProvider } from "@instnt/instnt-react-js";
import { parseDate2 } from "../utils/parseDate";

const sandbox = process.env.REACT_APP_SANDBOX === true;
const LIVE_SERVICE_URL = "https://api.instnt.org";
const SANDBOX_SERVICE_URL = "https://sandbox-api.instnt.org";
const formKey = "v1646824334575333";
const documentType = "License";
const serviceURL = SANDBOX_SERVICE_URL;

export const InstntContext = React.createContext();

export const InstntProvider = ({ children }) => {
  const [instnt, setInstnt] = useState(null);
  const instntRef = useRef(instnt);
  const [instntDecision, setInstntDecision] = useState(null);
  const [message, setMessage] = useState("");
  const [documentsCount, setDocumentsCount] = useState(0);
  const [submitCount, setSubmitCount] = useState(0);
  const [checkDecision, setCheckDecision] = useState(0);

  const setFormData = async (form) => {
    const { firstName, lastName, ssnNumber, email, phone, dateOfBirth } = form;
    const formData = {
      dob: parseDate2(dateOfBirth), // parse to format YYYY-MM-DD
      mobileNumber: phone,
      email: "test123@gmail.com",
      nationalId: ssnNumber,
      firstName,
      middleName: "",
      surName: lastName,
    };

    instntRef.current.formData = formData;
  };

  const verifyDocuments = () => {
    if (documentsCount === 2) {
      instntRef.current.verifyDocuments(documentType);
      instntRef.current.submitData(instntRef.current.formData);
      // every time verification runs we need to trigger error handling timer that is used below (remove once instnt error handling is fixed)
      setSubmitCount(submitCount + 1);
    }
  };

  // -------- THESE BLOCK OF CODE SHOULD BE REMOVED ONCE transaction.error IS FIXED BY INSTNT --------
  useEffect(() => {
    // #toberemoved
    if (documentsCount === 2 && submitCount) {
      if (message) setMessage("");
      const interval = setInterval(() => {
        clearInterval(interval);
        setCheckDecision(checkDecision + 1);
      }, 14000);
      // if (instntDecision) {
      //   clearInterval(interval);
      // }
    }
  }, [submitCount, instntDecision]);

  useEffect(() => {
    // check if there is decision after waiting time #toberemoved
    if (documentsCount === 2 && submitCount && !instntDecision) {
      setMessage("Instnt validation error");
    }
  }, [checkDecision]);

  //  ---------------------------------------------------------------------------------------------------

  const uploadInstntDocuments = ({ files, form }) => {
    const attachmentF = `data:image/jpeg;base64,${files.frontSide}`;
    const attachmentB = `data:image/jpeg;base64,${files.backSide}`;
    setFormData(form);
    if (documentsCount < 2) {
      instntRef.current.uploadAttachment(attachmentF, "Front", false);
      instntRef.current.uploadAttachment(attachmentB, "Back", false);
    } else {
      // if the validation failed and user runs verification again without reuploading documents
      verifyDocuments();
    }
  };

  useEffect(() => {
    // verify documents once they are uploaded
    verifyDocuments();
  }, [documentsCount]);

  const onEventHandler = (event) => {
    console.log(event.type, event.data);
    switch (event.type) {
      case "transaction.initiated":
        setInstnt(event.data.instnt);
        instntRef.current = event.data.instnt;
        break;
      case "document.capture-onEvent":
        break;
      case "document.uploaded":
        setDocumentsCount((prevState) => prevState + 1);
        break;
      case "document.error":
        break;
      case "transaction.processed":
        setInstntDecision(event.data);
        break;
      case "transaction.error":
        setMessage(event.data);
        break;
      case ".error":
      case event.type.match(/.error/)?.input:
        setMessage(event.data);
        break;
      default:
        console.log("unhandled instnt event ", event);
    }
  };

  const expose = {
    uploadInstntDocuments,
    instntRef,
    instntDecision,
    instntError: message,
  };
  return (
    <InstntContext.Provider value={expose}>
      <InstntSignupProvider
        formKey={formKey}
        sandbox={sandbox}
        onEvent={onEventHandler}
        serviceURL={serviceURL}
      >
        {children}
      </InstntSignupProvider>
    </InstntContext.Provider>
  );
};

export const useInstntData = () => {
  const context = React.useContext(InstntContext);

  if (context === undefined) {
    throw new Error("component must be used within a InstntProvider");
  }
  return context;
};
