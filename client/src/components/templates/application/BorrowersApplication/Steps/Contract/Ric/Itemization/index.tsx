/* eslint-disable react/no-unescaped-entities */
import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  .heading {
    text-align: left;
    margin: 0;
    margin-bottom: 10px;
  }
`;

function TruthInLending() {
  return (
    <Wrapper>
      <div className="no-break start-page">
        <div className="heading">
          <b>ITEMIZATION OF THE AMOUNT FINANCED OF $</b>
        </div>
        <div className="table-container">
          <table>
            <tbody>
              <tr>
                <td className="table-col">$0</td>
                <td className="table-col">Amount given to you directly</td>
              </tr>
              <tr>
                <td className="table-col">$0</td>
                <td className="table-col">Amount paid on your account</td>
              </tr>
              <tr>
                <td className="table-col" colSpan={2}>
                  Amount paid to others on your behalf:
                </td>
              </tr>
              <tr>
                <td className="table-col">$_____</td>
                <td className="table-col">to _____________________</td>
              </tr>
              <tr>
                <td className="table-col">$0</td>
                <td className="table-col">Prepaid finance charge</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Wrapper>
  );
}

export default TruthInLending;
