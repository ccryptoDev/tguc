import React from "react";

function Acceptance() {
  return (
    <>
      <h4> SIGNATURE AND ACCEPTANCE OF ALL TERMS AND CONDITIONS </h4>
      <div>
        <b> BY TYPING YOUR NAME AND &apos;I AGREE&apos; BELOW, YOU ARE ELECTRONICALLY SIGNING THIS AGREEMENT AND AGREEING TO ALL THE TERMS OF THIS AGREEMENT INCLUDING THE ARBITRATION PROVISION AND THE CONSENT TO ELECTRONIC COMMUNICATIONS.</b>
      </div>
      <div>
        <b> YOU ALSO ACKNOWLEDGE YOUR ABILITY TO DOWNLOAD OR PRINT A FULLY COMPLETED COPY OF THIS AGREEMENT FOR YOUR RECORDS.</b>
      </div>
      <table className="no-break" style={{ margin: "1rem 0" }}>
        <tbody>
          <tr>
            <td>
              <div className="field">TYPE YOUR NAME: </div>
            </td>
            <td>
              <div className="field">DATE:</div>
            </td>
          </tr>
        </tbody>
      </table>
      <br />
    </>
  );
}

export default Acceptance;
