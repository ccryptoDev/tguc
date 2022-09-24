import React from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import Heading from "../../../../../molecules/Typography/admin/DetailsHeading";
import { converter } from "../Rules-details/parsers";
import { getAdminRoles } from "../../../../../../helpers/index";
import { useUserData } from "../../../../../../contexts/admin";
import SummaryTable from "./Tables/Table-Application-Summary";

const Wrapper = styled.div`
  font-family: "Poppins";
  font-size: 1.4rem;
  line-height: 3rem;

  .row {
    display: flex;
  }
  .key {
    padding-right: 1rem;
  }

  h2 {
    margin-top: 1rem;
  }

  table {
    width: 100%;
    & tr {
      border: 1px solid #dee2e6;
      width: 100%;
      margin: 5px;
    }
  }
`;

const formatPropString = (value) => {
  const str = value.replace(/([A-Z][a-z])/g, " $1");
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const renderObjects = (obj, property, recursion) => {
  return (
    <div>
      <div style={{ color: "#005282" }}>
        <h2>{formatPropString(property)}</h2>
      </div>
      <table>
        <tbody>
          <tr>
            <td style={{ marginLeft: "2rem" }}>{recursion(obj[property])}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const renderArray = (obj, property, recursion) => {
  return (
    <div>
      <div style={{ color: "#005282" }}>
        <h2>{formatPropString(property)}</h2>
      </div>
      <table>
        <tbody>
          {obj[property].map((item) => (
            <tr className="row" key={uuidv4()}>
              <td style={{ marginLeft: "2rem" }}>
                {typeof item === "object" ? recursion(item) : item}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const renderFields = (obj, property) => {
  return (
    <tr key={property}>
      <td style={{ color: "#000" }} className="key">
        {formatPropString(property)}:
      </td>
      <td className="value">{converter(obj[property])}</td>
    </tr>
  );
};

const CreditReport = ({ state }) => {
  const { user } = useUserData();
  const midDesk = state?.midDesk;

  // DEFINE ADMIN ROLE
  const role = user?.user?.data?.role?.roleName;
  const adminRoles = getAdminRoles();

  const renderMidDesk = () => {
    const render = (obj) => {
      return Object.keys(obj).map((property) => {
        if (obj[property]) {
          if (Array.isArray(obj[property]) && obj[property].length) {
            return renderArray(obj, property, render);
          }
          if (typeof obj[property] === "object") {
            return renderObjects(obj, property, render);
          }
          return renderFields(obj, property);
        }
        return <></>;
      });
    };
    return render(midDesk);
  };
  const report = state?.creditReport;
  const renderRules = () => {
    const render = (obj) => {
      return Object.keys(obj).map((property) => {
        if (obj[property]) {
          if (Array.isArray(obj[property]) && obj[property].length) {
            return renderArray(obj, property, render);
          }
          if (typeof obj[property] === "object") {
            return renderObjects(obj, property, render);
          }
          return renderFields(obj, property);
        }
        return <></>;
      });
    };
    return render(report);
  };

  return (
    <Wrapper>
      <Heading text="Application Summary" />
      <SummaryTable />
      {state?.screenTracking.isContractor ? (
        <Heading text="MidDesk Business Report" />
      ) : (
        ""
      )}
      <Heading text="Middesk Report" />
      {renderMidDesk()}
      <Heading text="Experian US Consumer Credit Report" />
      {renderRules()}
    </Wrapper>
  );
};

export default CreditReport;
