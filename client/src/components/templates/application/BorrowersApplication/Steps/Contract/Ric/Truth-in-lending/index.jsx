/* eslint-disable react/no-unescaped-entities */
import React from "react";
import styled from "styled-components";
import { v4 as uuid } from "uuid";
import {
  formatCurrency,
  formatDate,
} from "../../../../../../../../utils/formats";

const Wrapper = styled.div`
  font-size: 14px;
  .table-cubes-item-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  #truth-in-lending-disclosure {
    width: 100%;
    border-collapse: collapse;
  }

  #truth-in-lending-disclosure td,
  #truth-in-lending-disclosure th {
    border: none;
    padding: 0;
  }

  #truth-in-lending-disclosure td {
    position: relative;
    width: 25%;
    padding-top: 25%;
  }

  .table-cubes {
    position: absolute;
    top: 20px;
    left: 0;
  }

  .table-cubes-item {
    padding: 4px;
    border: 1px solid #000;
    border-right: none;
    word-break: break-word;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    text-align: center;
    font-size: 1.4rem;
  }

  .table-cubes-item-content {
    height: 100%;
    position: relative;
  }

  .table-cubes-item-heading {
    text-align: left;
    font-weight: 700;
  }

  .table-cubes-item-description {
    position: absolute;
    padding-top: 40px;
    text-align: left;
  }

  .table-cubes-item-unit {
    text-align: right;
    width: 100%;
  }

  .prepayment-options {
    list-style: none;
  }

  #payment-schedule-table {
    font-size: 14px;
    text-align: center;
  }

  #payment-schedule-table td,
  #payment-schedule-table th {
    padding: 5px;
    border: 1px solid;
  }

  #payment-schedule-table td:not(:last-child) {
    width: 30%;
  }

  #payment-schedule-table tbody {
    word-break: break-all;
  }

  .schedule-table .schedule-heading {
    padding: 4px 4px 0;
  }

  .creditor-field {
    display: flex;
    align-items: center;
    margin: 20px 0;
    .label {
      margin-right: 10px;
    }
    .field {
      border-bottom: 1px solid #000;
      height: 30px;
      flex-grow: 1;
    }
  }
`;

const renderPaymentSchedule = ({
  regularPayments = {},
  lastPayment = {},
  totalPayments = {},
}) => {
  return [regularPayments, lastPayment, totalPayments];
};

function TruthInLending({
  paymentScheduleInfo = {
    regularPayments: {},
    lastPayment: {},
    totalPayments: {},
  },
}) {
  return (
    <Wrapper>
      <div className="section-frame">
        <div className="no-break">
          <div className="heading">
            <b>FEDERAL TRUTH-IN-LENDING DISCLOSURES</b>
          </div>
          <div className="creditor-field">
            <div className="label">
              <b>Creditor:</b>
            </div>
            <div className="field" />
          </div>
          <div className="table-container">
            <table id="truth-in-lending-disclosure">
              <tbody>
                <tr>
                  <td>
                    <div className="table-cubes-item">
                      <div className="table-cubes-item-content">
                        <div className="table-cubes-item-heading">
                          ANNUAL PERCENTAGE RATE
                        </div>
                        <div className="table-cubes-item-description">
                          The cost of your credit as a yearly rate.
                        </div>
                        <div className="table-cubes-item-unit">50%</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="table-cubes-item">
                      <div className="table-cubes-item-content">
                        <div className="table-cubes-item-heading">
                          FINANCE CHARGE
                        </div>
                        <div className="table-cubes-item-description">
                          The dollar amount the credit will cost you.
                        </div>
                        <div className="table-cubes-item-unit">$1,000</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="table-cubes-item">
                      <div className="table-cubes-item-content">
                        <div className="table-cubes-item-heading">
                          Amount Financed
                        </div>
                        <div className="table-cubes-item-description">
                          The amount of credit provided to you or on your
                          behalf.
                        </div>
                        <div className="table-cubes-item-unit">$2,000</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div
                      className="table-cubes-item"
                      style={{ borderRight: "1px solid" }}
                    >
                      <div className="table-cubes-item-content">
                        <div className="table-cubes-item-heading">
                          Total of Payments
                        </div>
                        <div className="table-cubes-item-description">
                          The amount you will have paid after you have made all
                          payments as scheduled.
                        </div>
                        <div className="table-cubes-item-unit">$3,000</div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="schedule-table no-break">
          <p className="schedule-heading">
            <strong>Your payment schedule will be: </strong>
          </p>
          <div className="table-container">
            <table id="payment-schedule-table">
              <thead>
                <tr>
                  <th> Number of Payments </th>
                  <th> Amount of Payments </th>
                  <th> When Payments Are Due </th>
                </tr>
              </thead>
              <tbody>
                {renderPaymentSchedule(paymentScheduleInfo).map(
                  ({ numberOfPayments = "", amount = "", due = "" }) => {
                    return (
                      <tr key={uuid()}>
                        <td>{numberOfPayments}</td>
                        <td>{formatCurrency(amount)}</td>
                        <td>{due}</td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </div>
        <p>
          <b>Secured: </b>
          This loan is secured by the goods purchased with the loan proceeds.
        </p>
        <p>
          <b>Late Charge: </b>
          If payments are made more than 10 days late, (15 days in NE) buyer may
          be charged a late fee of: 5% of the unpaid portion of your monthly
          payment or $25, whichever is less in AR, NM, and UT; $10 in FL; $15 in
          NC and WI.
        </p>
        <p>
          <b>Prepayment: </b>
          If you pay off early, you
        </p>
        <ul className="prepayment-options">
          <li>
            <p>&#x2610; may &#x2612; will not have to pay a penalty.</p>
          </li>
          <li>
            <p>
              &#x2612; may &#x2610; will not be entitled to a refund of part of
              the finance charge.
            </p>
          </li>
        </ul>
        <p>
          See your contract documents for any additional information about
          nonpayment, default, any required repayment in full before the
          scheduled date, and prepayment refunds and penalties.
        </p>
      </div>
    </Wrapper>
  );
}

export default TruthInLending;
