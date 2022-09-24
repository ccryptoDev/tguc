import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Tabs from "../Components/Tabs";
import Document from "./Document";
import Header from "../Components/Header";
import EConsent from "../../../../assets/pdf/E-Consent.pdf";
import { fetchBorrowerDocumentsApi } from "../../../../api/application";
import { useUserData } from "../../../../contexts/user";

const Wrapper = styled.div`
  .header-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .fields-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 12px;
    padding: 16px;
  }

  @media screen and (max-width: 650px) {
    .fields-layout {
      grid-template-columns: 1fr;
    }
  }
`;

const docs = ({ driversLicense, passport = "" }: any) => [
  {
    name: "Drivers License Front",
    link: driversLicense?.front,
  },
  {
    name: "Drivers License Back",
    link: driversLicense?.back,
  },
  { name: "Passport", link: passport },
  {
    name: "E-Consent",
    link: EConsent,
  },
  {
    name: "Loan Agreement",
    link: "https://tguc.alchemylms.com/api/application/s3asset/UserDocuments/20919aec-c751-4daa-ba30-405c12f86fa9/DriversLicense/front.jpeg",
  },
];

const UserInformation = ({ route }: { route: string }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const { userId } = useUserData();
  const [error, setError] = useState("");

  async function getDocuments() {
    const result: any = await fetchBorrowerDocumentsApi(userId);
    const driversLicense = result?.data?.userDocuments[0]?.driversLicense;
    const passport = result?.data?.userDocuments[0]?.passport;
    const docsArray = docs({ driversLicense, passport });
    setDocuments(docsArray);
    if (result && result?.error) {
      const message =
        result?.error?.response?.data?.message || "something went wrong";
      setError(message);
    }
  }

  useEffect(() => {
    getDocuments();
  }, []);

  return (
    <Wrapper>
      <Tabs activeRoute={route} tabName="Document Center" />
      <Header>Document Center</Header>
      <div className="fields-layout">
        {documents.length
          ? documents.map(({ name, link }) => {
              return <Document key={name} name={name} url={link} />;
            })
          : ""}
      </div>
    </Wrapper>
  );
};

export default UserInformation;
