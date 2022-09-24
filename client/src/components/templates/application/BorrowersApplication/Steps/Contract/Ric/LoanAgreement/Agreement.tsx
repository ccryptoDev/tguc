import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  li {
    margin: 12px 0;
  }

  ol {
    padding-left: 10px;
  }

  .list-alpha {
    & > li {
      list-style: lower-alpha;
    }
  }

  .list-roman {
    & > li {
      list-style: lower-roman;
    }
  }

  @media print {
    & > ol {
      padding-left: 22px;
    }
  }
`;

const Agreement = () => {
  return (
    <Wrapper className="agreement-content">
      <ol>
        <li>
          <p>
            <b>Your Loan.</b>
          </p>
          <ol className="list-alpha">
            <li>
              <p>
                <span className="underline">Loan Purpose.</span> Your Loan is
                secured, closed-end credit provided to you for personal,family,
                or household purposes.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">Loan Disbursement.</span>
              </p>
              <ol className="list-roman">
                <li>
                  <p>
                    <span className="underline">Origination.</span>
                    Your Loan will be originated on the first date any
                    Loanproceeds are disbursed. You have no obligation on your
                    Loan until it has beenoriginated.
                  </p>
                </li>
                <li>
                  <p>
                    <span className="underline">Disbursement Period.</span>
                    You have a ninety (90)-day window (“DisbursementPeriod”),
                    commencing on the date you sign or accept this Agreement,
                    duringwhich you may direct us to disburse your Loan proceeds
                    on dates within theDisbursement Period. If you do not direct
                    us to disburse any of your Loanproceeds during the
                    Disbursement Period, this Agreement will
                    terminateautomatically upon the expiration of the
                    Disbursement Period and will be of noforce and effect.
                  </p>
                </li>
                <li>
                  <p>
                    <span className="underline">Disbursements.</span>
                  </p>
                  <ol className="list-roman">
                    <li>
                      <p>
                        <span className="underline">Initial Disbursement.</span>
                        During the Disbursement Period, you maydirect us to make
                        an initial disbursement of your Loan proceeds on a
                        datewithin the Disbursement Period (“Initial
                        Disbursement”). The InitialDisbursement may be in any
                        amount up to the Amount Financed. If youdirect us to
                        disburse the Initial Disbursement on a date that is not
                        aBusiness Day, we will disburse the requested Loan
                        proceeds on the firstBusiness Day following the date you
                        directed.
                      </p>
                    </li>
                    <li>
                      <p>
                        <span className="underline">
                          Additional Disbursement.
                        </span>
                        If the Initial Disbursement is in anamount that is less
                        than the Amount Financed, then during theDisbursement
                        Period you may direct us to make additional
                        disbursementsof your Loan proceeds, in any amount up to
                        the then-undisbursed portionof the Amount Financed, on
                        dates within the Disbursement Period afterthe Initial
                        Disbursement. If you direct us to make any
                        additionaldisbursement on a date that is not a Business
                        Day, we will disburse therequested Loan proceeds on the
                        first Business Day following the date youdirected.
                      </p>
                    </li>
                    <li>
                      <p>
                        <span className="underline">Non-Revolving Loan.</span>
                        Any portion of your Loan that is repaidduring the
                        Disbursement Period will not be considered to be
                        undisbursed,and it will not be available to you for
                        additional disbursements.
                      </p>
                    </li>
                    <li>
                      <p>
                        <span className="underline">Undisbursed Amounts.</span>
                        If you do not direct us during theDisbursement Period to
                        disburse all of the proceeds of your Loan on dateswithin
                        the Disbursement Period, then the Amount Financed will
                        bereduced by the amount of your Loan proceeds remaining
                        undisbursed atthe end of the Disbursement Period. We
                        will provide you a statement 5 itemizing any
                        disbursements and reflecting any reductions to the
                        Amount Financed.
                      </p>
                    </li>
                  </ol>
                </li>
                <li>
                  <p>
                    <span className="underline">Disbursement Recipient.</span>
                    You direct us to disburse the proceeds of yourLoan directly
                    to the Service Provider indicated at the beginning of this
                    Agreement(“Service Provider”).
                  </p>
                </li>
              </ol>
            </li>
            <li>
              <p>
                <span className="underline">Term.</span>
                The length of your Loan is _________ (_________) months from the
                first date anyof your Loan proceeds are disbursed (“Term”).
              </p>
            </li>
          </ol>
        </li>
        <li>
          <p>
            <b>Interest and Fees.</b>
          </p>
          <ol className="list-alpha">
            <li>
              <p>
                <span className="underline">Interest Rates. </span>
                You will pay interest on the unpaid principal balance
                (“PrincipalBalance”) at an annual rate of _________ percent
                (_________%) during the Term, untilthe Principal Balance has
                been paid in full, provided that you have not defaulted on
                thisAgreement. Interest will be calculated on a daily simple
                interest basis according to theoutstanding Principal Balance
                each day during the Term. The daily interest rate will beequal
                to the annual interest rate in effect on that day, divided by
                three hundred and sixty-five (365) days in a calendar year.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">Origination Fee. </span>
                You will not be charged an origination fee in connection with
                yourLoan.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">Late Fee. </span>
                If payments are made more than 10 days late, (15 days in NE)
                buyer may becharged a late fee of: 5% of the unpaid portion of
                your monthly payment or $25,whichever is less in AR, NM, and UT;
                $10 in FL; $15 in NC and WI. The Late Fee willbe charged in
                addition to any interest accruing on the amount overdue.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">Non-Sufficient Funds Fee. </span>
                If any payment on your Loan is returned for any reason,including
                non-sufficient funds or stop payment orders, we will charge you
                a fee of zerodollars ($0.00) (“NSF Fee”) for each such returned
                payment to the extent permitted byapplicable law. The NSF Fee
                will be charged in addition to any interest accruing on
                thereturned amount.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">Charges. </span>
                Notwithstanding any other provision of this Agreement, the
                aggregate interestrate charged with respect to any obligation
                under this Agreement, including all relatedfees or charges
                deemed to be interest under applicable law, will not exceed the
                maximumamount permitted by applicable law. If we are deemed to
                receive as interest an amountwhich would exceed the maximum
                amount permitted by applicable law, the receipt ofsuch excess
                amount will be deemed a mistake and such excess amount (i) will
                becanceled automatically or (ii) if paid, will be (a) credited
                against the Principal Balance tothe extent permitted by
                applicable law, or (b) rebated to you to the extent such
                excessamount cannot be credited against the Principal Balance
                under applicable law.
              </p>
            </li>
          </ol>
        </li>
        <li>
          <p>
            <b>Interest Waiver Promotion.</b>
            We may offer you an interest waiver promotion on your Loan.If we do
            so, then under such a promotion we will waive the accrued finance
            charges and willapply any paid finance charges towards your
            Principal Balance, if you pay an amount equalto your entire
            Principal Balance before the end of the applicable promotional
            period andsatisfy any other applicable terms of our promotional
            offer. Any such promotion will begoverned by the terms of our
            promotional offer and this Agreement.
          </p>
        </li>
        <li>
          <p>
            <b>Payments.</b>
          </p>
          <ol className="list-alpha">
            <li>
              <p>
                <span className="underline">Promise to Pay.</span>
                You agree to pay us the Amount Financed (as may be reduced
                inaccordance with Section 1.b.iii of this Agreement), interest,
                and all other amounts youowe us under this Agreement (“Balance”)
                when due (“Due Date”).
              </p>
            </li>
            <li>
              <p>
                <span className="underline">Payments.</span>
              </p>
              <ol className="list-roman">
                <li>
                  <p>
                    Your monthly payments (together, “Monthly Payments”) are
                    calculated to fullyamortize each disbursement of a portion
                    of the Amount Financed over the portionof the Term remaining
                    as of such disbursement date, such that principal and
                    anyinterest for each disbursement will be paid in equal
                    monthly installments, withpayments for all disbursements
                    commencing on the date that is thirty (30) daysafter the
                    date of the Initial Disbursement, and continuing on the same
                    day of eachsuccessive month during the Term. These estimated
                    payments and the relatedpayment schedule are provided in the
                    Federal Truth in Lending Disclosures.
                  </p>
                </li>
                <li>
                  <p>
                    Your Monthly Payments, together with any Late Fees and NSF
                    Fees incurred,must be paid on or before the applicable Due
                    Date. Each Due Date will be thesame day of each successive
                    month during the Term. If this day does not fall on
                    aBusiness Day (defined in Section 12.c), your Due Date will
                    be the followingBusiness Day. If your initial Due Date is on
                    the 29th, 30th, or 31st of the month,and a subsequent month
                    does not have a 29th, 30th, or 31st, the Due Date in
                    thatmonth will be the last day of the month in which the
                    payment is due.
                  </p>
                </li>
                <li>
                  <p>
                    At the end of the Term, you must pay us any remaining
                    Balance in full. Your lastpayment may be a different amount,
                    which could be higher to adjust for additionalinterest
                    charges in certain instances, such as if you make a payment
                    after the DueDate. In such cases, the amount of the last
                    payment will be adjusted by theamount necessary to repay
                    your Loan in full.
                  </p>
                </li>
              </ol>
            </li>
            <li>
              <p>
                <span className="underline">Currency.</span>
                All payments related to this Agreement will be made in U.S.
                Dollars.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">Prepayment.</span>
                You may prepay all or any portion of your Loan before it is due
                withoutpenalty. Any payment made in excess of your Monthly
                Payment, together with any LateFees and NSF Fees incurred, will
                be applied to your Balance and will not reduce theamount of your
                next Monthly Payment.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">Application of Payments.</span>
                Payments are credited on the Business Day they are received,
                ifwe receive your payment before 11:59 p.m. ET on that Business
                Day. Payments receivedafter 11:59 p.m. ET on a Business Day, or
                on a day that is not a Business Day, are 7 credited on the next
                Business Day. To the extent permitted by applicable law,
                payments are applied in the following order:
              </p>
              <ol className="list-roman">
                <li>
                  <p>
                    To any charges or fees (including Late Fees and NSF Fees)
                    you incur,other than interest;
                  </p>
                </li>
                <li>
                  <p>To the accrued interest; and</p>
                </li>
                <li>
                  <p>To the remaining Balance.</p>
                </li>
              </ol>
              <p>
                We accept partial payments less than your required Monthly
                Payment. If your payment does not satisfy the entire Monthly
                Payment due, your payment will be applied in the order listed
                above, and we may charge you a Late Fee. Our acceptance of
                partial payments does not change your obligation to pay us all
                amounts you owe us under this Agreement when due.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">Payment Methods.</span>
              </p>
              <ol className="list-romwn">
                <li>
                  <p>
                    <span className="underline">Permissible Methods.</span>
                    You may make payments on your Loan in the followingways:
                  </p>
                  <ol className="list-alpha">
                    <li>
                      <p>
                        <span className="underline">AutoPay.</span>
                        You may authorize us to automatically process all
                        MonthlyPayments by preauthorized electronic fund
                        transfers that debit yourdesignated bank account each
                        month (“AutoPay”). You can establish,view, change, or
                        cancel AutoPay in your Online Account. If you want
                        tochange or cancel a scheduled AutoPay payment or
                        recurring AutoPayauthorization, you must do so at least
                        three (3) Business Days prior to thedate the next
                        payment is scheduled.
                      </p>
                    </li>
                    <li>
                      <p>
                        <span className="underline">
                          One-Time Electronic Payment.
                        </span>
                        You may authorize a one-time electronicpayment in your
                        Online Account. You must schedule the one-timeelectronic
                        payment at least three (3) Business Days prior to the
                        Due Dateto be sure it is received on or before the Due
                        Date.
                      </p>
                    </li>
                    <li>
                      <p>
                        <span className="underline">Paper Check.</span>
                        You may send to us a paper check drawn upon a
                        financialinstitution located in the U.S. at P.O. Box
                        78843, Phoenix, AZ 85062-8842. You must deliver your
                        paper check payment at least three (3)Business Days
                        prior to the Due Date to be sure it is received on or
                        beforethe Due Date.
                      </p>
                    </li>
                    <li>
                      <p>
                        <span className="underline">Bill Pay.</span>
                        Your financial institution may make a bill pay service
                        availableto you, which may be able to authorize
                        automatic or one-time electronicpayments on your Loan.
                        The terms and conditions of using such a serviceare
                        between you and your financial institution, and we are
                        not responsiblefor any failure of your bill pay service
                        to timely deliver a payment to us.
                      </p>
                    </li>
                    <li>
                      <p>
                        <span className="underline">Other Methods.</span>
                        We may make additional payment methods available toyou
                        in our sole discretion.
                      </p>
                    </li>
                  </ol>
                </li>
                <li>
                  <p>
                    <span className="underline">Delays.</span>
                    We are not responsible for payment delays that may occur as
                    a result ofholidays, the processing schedule of your
                    financial institution, processing errors,or other events
                    beyond our control.
                  </p>
                </li>
              </ol>
            </li>
          </ol>
        </li>
        <li>
          <p>
            <b>Your Representations, Warranties, and Covenants.</b>
          </p>
          <ol className="list-alpha">
            <li>
              <p>
                As of the date of this Agreement, and continuing through the
                termination of thisAgreement, you represent, warrant, and
                covenant to us:
              </p>
              <ol className="list-roman">
                <li>
                  <p>
                    The information contained in your Loan application is true,
                    complete, and correctand is made in good faith, and no
                    material adverse change has occurred withrespect to your
                    financial position since you submitted your Loan
                    application.
                  </p>
                </li>
                <li>
                  <p>
                    You are not the subject of proceedings under the U.S.
                    Bankruptcy Code, have notassigned your assets for the
                    benefit of creditors, and have not been having anydifficulty
                    paying amounts due to others in full and when due.
                  </p>
                </li>
                <li>
                  <p>
                    You are not and will not become a target of any economic
                    sanctions issued by anyU.S. government body.
                  </p>
                </li>
                <li>
                  <p>
                    The proceeds of the Loan will not be used for any unlawful
                    purpose.
                  </p>
                </li>
                <li>
                  <p>
                    You have and maintain a written agreement with the Service
                    Provider for thedelivery of goods or services to you, which
                    states the total amount you will paythe Service Provider for
                    such goods or services, and which comprises the
                    entireagreement between you and the Service Provider
                    relating to such goods orservices.
                  </p>
                </li>
                <li>
                  <p>
                    You comply with all federal, state, and local laws,
                    regulations, ordinances, orders,and other requirements of
                    any government body.
                  </p>
                </li>
              </ol>
            </li>
            <li>
              <p>
                As of each date on which any of your Loan proceeds are
                disbursed, you represent andwarrant to us:
              </p>
              <ol className="roman">
                <li>
                  <p>
                    The Service Provider has actually and timely delivered goods
                    or services to you,as agreed between you and the Service
                    Provider.
                  </p>
                </li>
                <li>
                  <p>
                    You are satisfied with the quantity, quality, and timing of
                    the Service Provider’sgoods and services that have been
                    delivered to you.
                  </p>
                </li>
                <li>
                  <p>
                    There is no dispute, or basis for a dispute, between you and
                    the Service Provider.
                  </p>
                </li>
              </ol>
            </li>
          </ol>
        </li>
        <li>
          <b>Security Agreement and Collateral.</b>
          <ol className="list-alpha">
            <li>
              <p>
                <span className="underline">Security.</span>
                To secure your obligations under this Agreement, including all
                payments ofprincipal, interest, fees, costs, and other amounts
                as and when due, including futureadvances and charges, present
                or later occurring, to the extent permitted by applicablelaw you
                grant us, as of the date of this Agreement, a continuing lien
                upon and perfected 9 first priority security interest in, and
                right of setoff with respect to, all of your right, title, and
                interest in, to, and under (i) all of the personal property,
                including any fixtures, wherever found, that you now own or
                after acquire as described in Attachment A “Description of
                Collateral”; and (ii) all books, records, accessions, additions,
                attachments, accessories, parts, supplies, replacements,
                substitutions, modifications, improvements, products, proceeds,
                insurance proceeds, and collections related to the items
                described in clause 6.a(i) (collectively, the “Collateral”).
              </p>
            </li>
            <li>
              <p>
                <span className="underline">Financing Statements.</span>
                You authorize us to file at any time one or more
                financingstatements, lien entry forms, or other documents to
                perfect, amend, or continue anysecurity interest granted
                pursuant to this Agreement. You understand that such filingsmay
                be recorded in the jurisdiction where the Collateral is located
                and may cover goodswhich may be or may become fixtures at your
                home. You agree to cooperate with us toaccomplish such filings
                and authorize us to sign your name to effect the
                filing,amendment, or continuation of any such filings. You will
                take any action we request toperfect or protect our security
                interest in the Collateral and the priority of our
                securityinterest. You waive the benefit of any homestead or
                other exemptions in the Collateral, tothe extent permitted by
                applicable law. The security interest you grant to us in
                thisAgreement will be governed by Uniform Commercial Code -
                Article 9 (as adopted byCalifornia or other applicable state
                law) whether Article 9 applies by its terms or not.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">
                  As of the date of this Agreement, and continuing through
                  thetermination of this Agreement, you represent, warrant, and
                  covenant to us:
                </span>
              </p>
              <ol className="list-roman">
                <li>
                  <p>
                    You will keep the Collateral in good order and repair and
                    will promptly pay alltaxes, assessments, and other charges
                    upon the Collateral;
                  </p>
                </li>
                <li>
                  <p>
                    You will not encumber, sell, or otherwise transfer the
                    Collateral or any interest inthe Collateral without our
                    prior written consent;
                  </p>
                </li>
                <li>
                  <p>
                    You will possess all right, title, and interest in, to, and
                    under the real propertywhere the Collateral is located;
                  </p>
                </li>
                <li>
                  <p>
                    You will permit us and our agents to inspect the Collateral
                    from time to time; and
                  </p>
                </li>
                <li>
                  <p>
                    There is no current or reasonably expected lawsuit, claim,
                    bankruptcy orinsolvency proceeding, dispute, or other
                    proceeding, event, or procedure thatmight affect our
                    interest in the Collateral.
                  </p>
                </li>
              </ol>
            </li>
          </ol>
        </li>
        <li>
          <p>
            <b>Default.</b>
            You will be in default of this Agreement if at any time:
          </p>
          <ol className="list-apha">
            <li>
              <p>
                There is fraud or material misrepresentation by you in
                connection with your Loan;
              </p>
            </li>
            <li>
              <p>
                You fail to meet any of your payment obligations in this
                Agreement after we haveprovided you any notice and any
                opportunity to cure required by applicable law;
              </p>
            </li>
            <li>
              <p>
                You fail to notify us immediately of a change in your name,
                employment status,telephone number, e-mail address, or mailing
                address;
              </p>
            </li>
            <li>
              <p>You withdraw your consent to electronic communications;</p>
            </li>
            <li>
              <p>
                You become the subject of proceedings under the U.S. Bankruptcy
                Code or assign yourassets for the benefit of creditors;
              </p>
            </li>
            <li>
              <p>
                If any Collateral is deemed to be a fixture, any legal or
                equitable right, title, and interestin, to, and under the real
                property where the Collateral is located is in any manner
                sold,transferred, or otherwise divested by you without our prior
                written consent;
              </p>
            </li>
            <li>
              <p>
                If any judgment, lien, attachment, or execution is issued
                against you or the Collateral, orif you or any other person
                transfers, grants, or seeks to liquidate or create a
                securityinterest in the Collateral (e.g., by legal garnishment);
              </p>
            </li>
            <li>
              <p>
                You die or are declared legally incompetent or incapacitated; or
              </p>
            </li>
            <li>
              <p>
                You are in breach of any obligation under this Agreement or any
                other agreement youhave with us.
              </p>
            </li>
          </ol>
        </li>
        <li>
          <p>
            <b>
              Interest and Acceleration Upon Default; Rights and Remedies of
              Secured Party; Set off.
            </b>
          </p>
          <ol className="list-alpha">
            <li>
              <p>
                If you are in default of this Agreement, we may add all accrued
                and unpaid interest andother amounts to the Balance of your
                Loan, accelerate your Loan, and require you to payus your entire
                Balance outstanding immediately in one payment or as soon as we
                ask you.Further, with respect to the Collateral, we will have
                all of the rights and remedies of asecured party under Uniform
                Commercial Code - Article 9 (as adopted by California orother
                applicable state law), and if notice of intended repossession or
                liquidation of anyCollateral is required by law, it is agreed
                that five (5) days’ notice constitutes reasonablenotice to the
                extent permitted by law. The net cash proceeds resulting from
                our exerciseof any of these rights, after deducting to the
                extent permitted by law all charges, costs,and expenses
                (including reasonable attorneys’ fees), will be applied as
                payments againstyour Balance, and you will remain liable to us
                for the payment of any deficiency.
              </p>
            </li>
            <li>
              <p>
                Our rights described in Section 8.a are in addition to any
                rights of setoff we may have,and you agree that we may set off
                any amounts you are entitled to against any amountsyou owe us to
                the extent permitted by applicable law.
              </p>
            </li>
          </ol>
        </li>
        <li>
          <p>
            <b>Reporting and Sharing of Your Credit Information. </b>
            We may report information aboutyour Loan to consumer reporting
            agencies. Late payments, missed payments, or otherdefaults on your
            Loan may be reflected in your consumer credit report. You understand
            thatthe reporting of information about your Loan to consumer credit
            reporting agencies mayadversely affect your credit rating and your
            ability to get other credit. You also agree that wemay report your
            name, the fact that you have taken a Loan from us, and information
            aboutyour payment history on your Loan, including if you default, to
            investors in any investmentfund that owns your Loan or any interest
            in your Loan or to any other persons or investorsthat own your Loan
            or any interest in your Loan.
          </p>
        </li>
        <li>
          <p>
            <b>Change in Terms.</b>
          </p>
          <ol className="list-alpha">
            <li>
              <p>
                We may make certain changes to the terms of this Agreement at
                specified times or uponthe occurrence of specified events:
              </p>
              <ol className="list-roman">
                <li>
                  <p>
                    We can make administrative changes, such as changes in the
                    address for makingpayments, Due Dates, and any interest rate
                    rounding rules (if the change producesan insignificant
                    difference in the interest and fees you pay).
                  </p>
                </li>
                <li>
                  <p>
                    We can also make changes that will benefit you, such as
                    changes that offer youmore options or a temporary reduction
                    in fees.
                  </p>
                </li>
              </ol>
            </li>
            <li>
              <p>
                We can make any of these changes without your consent, unless
                this Agreement orapplicable law requires otherwise. We will give
                you any notice of change that is requiredby applicable law.
              </p>
            </li>
          </ol>
        </li>
        <li>
          <p>
            <b>NOTICE OF WAIVER OF JURY TRIAL AND ARBITRATION AGREEMENT.</b>
          </p>
          <div className="note-box">
            <p>
              This is a binding Arbitration Agreement (“Arbitration Agreement”).
              Subject to the terms of this Section, by signing this Agreement,
              you are agreeing to resolve Claims (defined in Section 11.a)
              between you and us through arbitration rather than in court. IF
              ARBITRATION IS COMMENCED, YOU ACKNOWLEDGE THAT NEITHER YOU NOR WE
              WILL HAVE THE RIGHT TO (I) HAVE A COURT OR JURY DECIDE THE CLAIM
              BEING ARBITRATED, (II) ENGAGE IN DISCOVERY (THAT IS, THE RIGHT TO
              OBTAIN INFORMATION FROM THE OTHER PARTY) TO THE SAME EXTENT THAT
              YOU OR WE COULD IN COURT, (III) PARTICIPATE AS A REPRESENTATIVE OR
              MEMBER OF ANY CLASS OF CLAIMANTS IN A CLASS ACTION, OR
              REPRESENTATIVE ACTION IN COURT OR IN ARBITRATION, RELATING TO ANY
              CLAIM SUBJECT TO ARBITRATION, OR (IV) JOIN OR CONSOLIDATE CLAIMS
              OTHER THAN YOUR OWN OR OUR OWN. OTHER RIGHTS AVAILABLE IN COURT
              MAY NOT BE AVAILABLE IN ARBITRATION. You have a right to opt out
              of the Arbitration Agreement. If you wish to exercise your right
              to opt out, please follow the instructions below.
            </p>
            <p>
              TO OPT OUT OF THIS ARBITRATION AGREEMENT FOR YOUR LOAN, YOU MUST
              WRITE US AT: P.O. Box 10071, Denver, CO 80250.
            </p>
            <p>YOU MUST:</p>
            <ol>
              <li>
                <p>GIVE WRITTEN NOTICE;</p>
              </li>
              <li>
                <p>
                  INCLUDE YOUR NAME AND CONTRACT NUMBER OR LAST FOURDIGITS OF
                  YOUR SOCIAL SECURITY NUMBER; AND
                </p>
              </li>
              <li>
                <p>STATE THAT YOU REJECT ARBITRATION.</p>
              </li>
            </ol>
            <p>
              TO BE EFFECTIVE, WE MUST RECEIVE YOUR WRITTEN NOTICE WITHIN THIRTY
              (30) DAYS OF THE DATE OF THIS AGREEMENT. 12 IF YOU OPT OUT, ANY
              DISPUTES WILL STILL BE GOVERNED BY THE LAWS OF THE STATE WHERE YOU
              RESIDE AND APPLICABLE FEDERAL LAW AND MUST BE BROUGHT WITHIN THE
              SUCH STATE’S COURT SYSTEM.
            </p>
          </div>
          <p>
            <b>PLEASE READ THIS SECTION CAREFULLY AS IT AFFECTS YOUR RIGHTS</b>
          </p>
          <ol className="list-alpha">
            <li>
              <p>
                <span className="underline">Agreement to Arbitrate. </span>
                You agree that any and all Claims that have arisen or may
                arisebetween you and us will be resolved exclusively through
                final and binding arbitration,rather than a court, in accordance
                with the terms of this Arbitration Agreement, exceptthat you or
                we may assert individual Claims in small claims court, if the
                Claims qualify.For purposes of this Arbitration Agreement,
                “Claim” means any claim, dispute, orcontroversy (whether in
                contract, tort, or otherwise) past, present, or future. The
                term“Claim” is to be given the broadest possible meaning and
                includes any Claim arisingfrom or relating to (i) your Loan,
                (ii) provisions of, or changes to, or additions to,provisions to
                this Agreement, (iii) collection of your obligations arising
                from your Loan,(iv)advertisements, promotions, or oral or
                written statements relating to this Agreementor any transactions
                between you and us pursuant to this Agreement, including any
                Claimregarding information obtained by us from, or reported by
                us to, consumer reportingagencies or others, (v) disputes
                between you and us or our parent companies, wholly ormajority
                owned subsidiaries, affiliates, predecessors, successors,
                assigns, agents,contractors, employees, officers, directors, or
                representatives arising from any transactionbetween you and us
                related to this Agreement, (vi) disputes regarding the
                validity,enforceability or scope of this Arbitration Agreement
                or this Agreement, or (vii) thisAgreement. This Arbitration
                Agreement does not preclude you from bringing issues tothe
                attention of federal, state, or local agencies, and such
                agencies can, if the law allows,seek relief against us on your
                behalf. You agree that, by entering into this
                ArbitrationAgreement, you and we are each waiving the right to a
                trial by jury or to participate in aclass action. Your rights
                will be determined by a neutral arbitrator, not a judge or
                jury.The Federal Arbitration Act governs the interpretation and
                enforcement of thisArbitration Agreement.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">
                  Prohibition of Class and Representative Actions and
                  Non-Individualized Relief.
                </span>
              </p>
              <p>
                YOU AND WE AGREE THAT EACH OF US MAY BRING CLAIMS AGAINST
                THEOTHER ONLY ON AN INDIVIDUAL BASIS AND NOT AS A PLAINTIFF
                ORCLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE ACTIONOR
                PROCEEDING. UNLESS BOTH YOU AND WE AGREE OTHERWISE,
                THEARBITRATOR MAY NOT CONSOLIDATE OR JOIN MORE THAN ONEPERSON’S
                OR PARTY’S CLAIMS AND MAY NOT OTHERWISE PRESIDE OVERANY FORM OF
                A CONSOLIDATED, REPRESENTATIVE, OR CLASSPROCEEDING. ALSO, THE
                ARBITRATOR MAY AWARD RELIEF (INCLUDINGMONETARY, INJUNCTIVE, AND
                DECLARATORY RELIEF) ONLY IN FAVOR OFTHE INDIVIDUAL PARTY SEEKING
                RELIEF AND ONLY TO THE EXTENTNECESSARY TO PROVIDE RELIEF
                NECESSITATED BY THAT PARTY’SINDIVIDUAL CLAIM(S), EXCEPT THAT YOU
                MAY PURSUE A CLAIM INCOURT SOLELY FOR PUBLIC INJUNCTIVE RELIEF
                UNDER APPLICABLE LAWTO THE EXTENT REQUIRED FOR THE
                ENFORCEABILITY OF THIS PROVISION.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">
                  Pre-Arbitration Dispute Resolution.
                </span>
                We are always interested in resolving disputesamicably and
                efficiently, and most customer concerns can be resolved quickly
                and to thecustomer’s satisfaction by contacting customer support
                at support@tgucfinancial.com. Ifsuch efforts prove unsuccessful,
                a party who intends to seek arbitration must first send tothe
                other, by certified mail, a written Notice of Dispute
                (“Notice”). The Notice to usshould be sent to P.O. Box 100071,
                Denver, CO 80250 (“Notice Address”). The Noticemust (i) describe
                the nature and basis of the Claim or dispute and (ii) set forth
                the specificrelief sought. If we and you do not resolve the
                Claim within sixty (60) days after theNotice is received, you or
                we may commence an arbitration proceeding. During
                thearbitration, the amount of any settlement offer made by us or
                you will not be disclosed tothe arbitrator until after the
                arbitrator determines the amount, if any, to which you or weare
                entitled.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">Arbitration Procedures. </span>
                Arbitration will be conducted by a neutral arbitrator
                inaccordance with the American Arbitration Association’s (“AAA”)
                rules and procedures,including the AAA’s Consumer Arbitration
                Rules (collectively, the “AAA Rules”), asmodified by this
                Arbitration Agreement. For information on the AAA, please visit
                itswebsite, http://www.adr.org. Information about the AAA Rules
                and fees for consumerdisputes can be found at the AAA’s consumer
                arbitration page,http://www.adr.org/consumer. If there is any
                inconsistency between any term of the AAARules and any term of
                this Arbitration Agreement, the applicable terms of this
                ArbitrationAgreement will control unless the arbitrator
                determines that the application of theinconsistent Arbitration
                Agreement terms would not result in a fundamentally
                fairarbitration. The arbitrator must also follow the provisions
                of this Agreement as a courtwould. All issues are for the
                arbitrator to decide, including issues relating to the
                scope,enforceability, and arbitrability of this Arbitration
                Agreement. Although arbitrationproceedings are usually simpler
                and more streamlined than trials and other judicialproceedings,
                the arbitrator can award the same damages and relief on an
                individual basisthat a court can award to an individual under
                the Agreement and applicable law.Decisions by the arbitrator are
                enforceable in court and may be overturned by a courtonly for
                very limited reasons.
              </p>
              <p>
                Unless we and you agree otherwise, any physical arbitration
                hearing that you attend willbe held in the federal judicial
                district for the district in which you reside. If you and weare
                unable to agree on a location, the determination will be made by
                AAA. If your Claimis for ten thousand dollars ($10,000) or less,
                we agree that you may choose whether thearbitration will be
                conducted solely on the basis of documents submitted to the
                arbitrator,through a telephonic hearing, or by an in-person
                hearing as established by the AAARules. Each party consents to
                the other party participating by telephone. If your Claimexceeds
                ten thousand dollars ($10,000), the right to a hearing will be
                determined by theAAA Rules. Regardless of the manner in which
                the arbitration is conducted, the arbitratorwill issue a
                reasoned written decision sufficient to explain the essential
                findings andconclusions on which the award is based.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">Costs of Arbitration. </span>
                Payment of all filing, administration, and arbitrator
                fees(collectively, the “Arbitration Fees”) will be governed by
                the AAA Rules, unlessotherwise provided in this Arbitration
                Agreement. The party initiating the arbitration will 14 pay the
                filing fee. You may seek a waiver of the initial filing fee or
                any other fees incurred in arbitration. If you demonstrate to
                the arbitrator that the costs of arbitration will be prohibitive
                as compared to the costs of litigation, we will pay as much of
                the Arbitration Fees as the arbitrator deems necessary to
                prevent the arbitration from being cost-prohibitive to you as
                compared to the costs of litigation. Any payment of attorneys’
                fees will be governed by the AAA Rules.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">Federal Arbitration Act. </span>
                This Arbitration Agreement is made pursuant to a
                transactioninvolving interstate commerce and will be governed by
                the Federal Arbitration Act(“FAA”), 9 U.S.C. §§ 1 et seq., as
                amended, notwithstanding any other governing lawprovision in
                this Agreement. The arbitrator will apply applicable substantive
                lawconsistent with the FAA and applicable statutes of
                limitations and will honor claims ofprivilege recognized at law.
                Judgment upon any arbitration award may be entered andenforced,
                including by garnishment, attachment, foreclosure or other
                post-judgmentremedies, in any court having jurisdiction. The
                arbitrator’s decision will be final andbinding, except for any
                right of appeal provided by the FAA. The decision of
                anarbitrator is as enforceable as any court order and may be
                subject to very limited reviewby a court. The exchange of
                non-privileged information relevant to the Claim betweenyou and
                us is permitted and encouraged. Either party may submit relevant
                information,documents or exhibits to the arbitrator for
                consideration in deciding a Claim. Unless bothyou and we
                otherwise agree in writing, any arbitration will be conducted
                only on anindividual basis and not in a class, collective,
                consolidated, or representative proceeding.However, you and we
                each retain: (a) the right to bring an individual action in a
                smallclaims court; and (b) the right to seek injunctive or other
                equitable relief in a court ofcompetent jurisdiction to prevent
                the actual or threatened infringement, misappropriationor
                violation of a party’s copyrights, trademarks, trade secrets,
                patents or other intellectualproperty rights.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">Confidentiality. </span>
                All aspects of the arbitration proceeding, and any ruling,
                decision, oraward by the arbitrator, will be strictly
                confidential for the benefit of you and us.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">Military Lending Act. </span>
                This Arbitration Agreement does not apply if you are a
                personcovered by the Military Lending Act.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">Severability. </span>
                If a court or the arbitrator decides that any provision of this
                ArbitrationAgreement (other than Section 11.b titled
                “Prohibition of Class and RepresentativeActions and
                Non-Individualized Relief”) is invalid or unenforceable, you and
                we agree toreplace such provision with a provision that is valid
                and enforceable and that comesclosest to expressing the
                intention of the invalid or unenforceable provision, and
                thisArbitration Agreement will be enforceable as so modified. If
                a court or the arbitratordecides that any of the provisions of
                Section 11.b titled “Prohibition of Class andRepresentative
                Actions and Non-Individualized Relief” are invalid or
                unenforceable, thenthe entirety of this Arbitration Agreement
                will be null and void, unless such provisionsare deemed to be
                invalid or unenforceable solely with respect to Claims for
                publicinjunctive relief.{" "}
                <b>
                  IF A CLAIM IS BROUGHT SEEKING PUBLIC INJUNCTIVERELIEF AND A
                  COURT DETERMINES THAT THE RESTRICTIONS IN THISSECTION AND/OR
                  SECTION 11.B TITLED “PROHIBITION OF CLASS AND 15
                  REPRESENTATIVE ACTIONS AND NON-INDIVIDUALIZED RELIEF” ARE
                  UNENFORCEABLE WITH RESPECT TO THAT CLAIM (AND THAT
                  DETERMINATION BECOMES FINAL AFTER ALL APPEALS HAVE BEEN
                  EXHAUSTED), THE CLAIM FOR PUBLIC INJUNCTIVE RELIEF WILL BE
                  LITIGATED IN COURT AND ANY INDIVIDUAL CLAIMS SEEKING MONETARY
                  RELIEF WILL BE ARBITRATED. IN SUCH A CASE YOU AND WE WILL
                  REQUEST THAT THE COURT STAY THE CLAIM FOR PUBLIC INJUNCTIVE
                  RELIEF UNTIL THE ARBITRATION AWARD PERTAINING TO INDIVIDUAL
                  RELIEF HAS BEEN ENTERED IN COURT. IN NO EVENT WILL A CLAIM FOR
                  PUBLIC INJUNCTIVE RELIEF BE ARBITRATED.
                </b>
                The remainder of the Agreement will continue to apply.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">
                  Future Changes to Arbitration Agreement.
                </span>
                Notwithstanding any provision in thisAgreement to the contrary,
                we agree that if we make any future change to this
                ArbitrationAgreement (other than a change to the Notice Address)
                during the Term, you may rejectany such change by sending us
                written notice to the Notice Address within thirty (30)days of
                the change. By rejecting any future change, you are agreeing
                that you willarbitrate any dispute between us in accordance with
                the provisions of this ArbitrationAgreement as of the date you
                first accepted this Agreement (or accepted any subsequentchanges
                to this Arbitration Agreement).
              </p>
            </li>
          </ol>
        </li>
        <li>
          <p>
            <b>Other Terms and Conditions.</b>
          </p>
          <ol className="list-alpha">
            <li>
              <p>
                <span className="underline">NOTICE.</span>
                ANY HOLDER OF THIS CONSUMER CREDIT CONTRACT IS SUBJECTTO ALL
                CLAIMS AND DEFENSES WHICH THE DEBTOR COULD ASSERTAGAINST THE
                SELLER OF GOODS OR SERVICES OBTAINED PURSUANTHERETO OR WITH THE
                PROCEEDS HEREOF. RECOVERY HEREUNDER BYTHE DEBTOR SHALL NOT
                EXCEED AMOUNTS PAID BY THE DEBTORHEREUNDER.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">
                  Third-Party Compensation Notice.{" "}
                </span>
                Your Service Provider may pay transaction fees as aresult of
                this Loan. Your Service Provider should not (i) impose higher
                prices, additionalfees, or any other less favorable economic
                terms upon you, or (ii) provide you goods orservices of a lesser
                quality or quantity, than those imposed upon or provided to
                customerswho do not finance their purchases (including cash
                purchases) from the Service Provider.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">Business Days. </span>
                “Business Days” are Monday through Friday, except Federal
                holidays.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">Applicable Law. </span>
                Unless otherwise provided in this Agreement, this Agreement will
                begoverned by applicable federal law; and, to the extent not
                preempted by federal law, thelaw, including the statutes of
                limitation, of the State of your residence, will govern
                thisAgreement, the interpretation and enforcement of its terms,
                and any claim or cause ofaction (in law or equity), controversy,
                or dispute arising out of or related to it or itsnegotiation,
                execution, or performance, whether based on contract, tort,
                statutory, orother law, in each case without giving effect to
                any conflicts-of-law or other principlerequiring the application
                of the law of any other jurisdiction.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">Severability. </span>
                If any provision of this Agreement is determined to be invalid
                orunenforceable, the other provisions of this Agreement remain
                in full force and effect, andto the extent permitted and
                possible, the invalid or unenforceable provisions will bedeemed
                replaced by provisions that are valid and enforceable and that
                come closest toexpressing the intention of the invalid or
                unenforceable provisions. This includes anyprovision prohibited
                by the Military Lending Act if you are a person covered by
                theprotections of the Military Lending Act.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">Waiver. </span>
                Our delay or failure to exercise any of our rights under this
                Agreement orapplicable law is not a waiver of our rights. Any
                waiver by us of any provision of thisAgreement on any one
                occasion will not be a waiver on any other occasion.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">Cosigners. </span>
              </p>
              <ol className="list-roman">
                <li>
                  <p>
                    <span className="underline">Communications.</span>
                    If this Agreement is signed by a borrower and any
                    cosigners,such borrower and cosigners agree that any
                    communication between us and any ofthem will be binding on
                    all of them, and that the provisions of this Agreement
                    willapply to all borrowers and cosigners individually and
                    collectively.
                  </p>
                </li>
                <li>
                  <p>
                    <span className="underline">
                      Joint and Several Liability.
                    </span>
                    Each borrower and cosigner is jointly and
                    severallyresponsible for repaying the full amount owed to us
                    under this Agreement. Thecosigner agrees that we may proceed
                    directly against the cosigner without firstproceeding
                    against the borrower and that the cosigner is fully
                    responsible forpaying all amounts due under this Agreement,
                    in full, even if the borrower isreleased from liability on
                    this Agreement for any reason.
                  </p>
                </li>
              </ol>
            </li>
            <li>
              <p>
                <span className="underline">Notices and Communications. </span>
                You authorize us to deliver notices to you by mail, at themost
                recent address we have on file for you, and if you have
                consented to electroniccommunications, by e-mail or any other
                electronic method to which you have consented.You authorize us
                to contact you using the contact information that you provide or
                that wereasonably associate with your Loan (including through
                skip trace, caller ID capture, orother means). Unless prohibited
                by applicable law, we may, and you authorize us to, (i)contact
                you using an autodialer, text message or automated text message,
                or prerecordedmessage, at any telephone number you have provided
                to us, including any mobile phonenumber; (ii) contact you at any
                address in our records or public or nonpublic databases;or (iii)
                contact other people who may provide employment, location, or
                contactinformation for you. You represent and warrant that the
                email addresses and telephonenumbers you have provided us are
                yours, and that you are permitted to be contacted by usat each
                of the telephone numbers and e-mail addresses you have provided
                to us. Youagree to alert us whenever you stop using a particular
                telephone number or email address.You agree that we may record
                any communication between us and you. YOUACKNOWLEDGE AND AGREE
                THAT YOU ARE RESPONSIBLE FOR ANYCOSTS YOU INCUR IN USING ANY
                MEANS OF COMMUNICATION DESCRIBEDIN THIS SECTION 12.H, INCLUDING
                RECEIVING TELEPHONE CALLS,TELEPHONE MESSAGES, TEXT MESSAGES,
                E-MAILS, AND OTHERCOMMUNICATIONS.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">
                  Updating Personal Information.
                </span>
                You agree to notify us immediately of any change inyour name,
                telephone number, e-mail address, or mailing address by
                contacting us atsupport@tgucfinancial.com. We may require you to
                provide documentary support orother information regarding these
                changes.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">Collections. </span>
                If you fail to make payments as required by this Agreement or
                you areotherwise in default of this Agreement, we may refer your
                Loan to a collection agency oran attorney for collection. You
                agree to pay any collection fees and costs, legal
                expenses(including reasonable attorney’s fees and costs), court
                fees and costs (including fees andcosts incurred in connection
                with any appellate or bankruptcy proceedings), and anyother fees
                and costs we incur to collect your Loan, as permitted by
                applicable law.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">
                  No Assignment or Assumption of Your Rights or Obligations
                </span>
                You may not assign yourrights and obligations under this
                Agreement or your Loan to any person. Any purportedassumption or
                assignment of this Agreement or your Loan by you is and will be
                voidwithout our prior written consent.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">
                  Our Assignment or Transfer of Our Rights or Obligations.
                </span>
                We may assign or transfer anyinterest in your Loan and this
                Agreement, or any of our rights or obligations in your Loanand
                this Agreement, to any person without notice to or consent from
                you. For the purposeof this Section 12.l, a transfer includes a
                sale or participation. Should ownership of yourLoan be
                transferred, you will be notified of the name, address, and
                telephone number ofthe new creditor if the address to which you
                must make payments changes. Anassignment or transfer of your
                Loan does not affect our rights under this Agreement.
              </p>
            </li>
            <li>
              <p>
                <span className="underline">
                  Customer Identification Policy Notice.{" "}
                </span>
                To help the government fight the funding ofterrorism and money
                laundering activities, federal law requires financial
                institutions toobtain, verify, and record information that
                identifies each person who opens an account.What this means for
                you:
                <b>
                  When you open an account, we will ask for your name,address,
                  date of birth, and other information that will allow us to
                  identify you. Wemay also ask to see your driver’s license or
                  other identifying documents.
                </b>
              </p>
            </li>
            <li>
              <p>
                <span className="underline">Military Lending Act Notice.</span>
                Federal law provides important protections to members ofthe
                Armed Forces and their dependents relating to extensions of
                consumer credit. Ingeneral, the cost of consumer credit to a
                member of the Armed Forces and his or herdependent may not
                exceed an annual percentage rate of 36 percent. This rate
                mustinclude, as applicable to the credit transaction or account:
                the costs associated with creditinsurance premiums; fees for
                ancillary products sold in connection with the
                credittransaction; any application fee charged (other than
                certain application fees for specifiedcredit transactions or
                accounts); and any participation fee charged (other than
                certainparticipation fees for a credit card account). To be
                provided with oral disclosures relatedto these protections,
                please call us at 1-877-744-1396.
              </p>
            </li>
          </ol>
        </li>
        <li>
          <p>
            <b>Additional Disclosures.</b>
            The following disclosures are or may be required by federal or
            statelaw and may not describe all of the rights that you have under
            federal and state law. Unlessotherwise indicated, each disclosure
            applies or may apply to you if you lived in the indicated 18 state
            on the date you signed your Loan application or this Agreement and
            if you are a resident of that state.
          </p>
        </li>
      </ol>
      <p>
        <b>UTAH RESIDENTS: </b>
        You give us, our representatives, and our agents, successors, and
        assigns permission to access your consumer credit report in connection
        with any transaction, or extension of credit, and on an ongoing basis,
        for the purpose of reviewing your account, taking collection action on
        your account, or for any other legitimate purposes associated with your
        account. Upon your request, you will be informed of whether or not a
        consumer credit report was ordered, and if it was, you will be given the
        name and address of the consumer reporting agency that furnished the
        report. As required by law, you are notified that a negative credit
        report reflecting on your credit record may be submitted to a consumer
        reporting agency if you fail to fulfill the terms of your credit
        obligations under this Agreement.
      </p>
      <p>
        <b>
          NEBRASKA AND UTAH RESIDENTS: Oral agreements or commitments to loan
          money, extend credit or to forbear from enforcing repayment of a debt,
          including promises to extend or renew such debt, are not enforceable.
          To protect you (borrower) and us (creditor) from misunderstanding or
          disappointment, any agreements we reach covering such matters are
          contained in this writing, which is the complete and exclusive
          statement of the agreement between us and you, except as we and you
          may later agree in writing to modify.
        </b>
      </p>
      <p>
        <b>WISCONSIN RESIDENTS:</b>
        For married Wisconsin residents, your signature confirms that this loan
        obligation is being incurred in the interest of your marriage or family
        and that your spouse has actual knowledge that credit is being extended
        to you. No provision of any marital property agreement, unilateral
        statement, or court decree under Wisconsin’s Marital Property Act
        adversely affects our rights, unless you give us a copy of such
        agreement, statement, or court order before we grant you credit, or we
        have actual knowledge of the adverse obligation. You understand that we
        may be required to give notice of this account to your spouse.
        <span className="underline">
          <b>
            If the account for which you are applying is granted, you agree to
            notify us if you have a spouse who needs to receive notification
            that credit has been extended to you by sending your name, your
            account number, and your spouse’s name and address to
            support@tgucfinancial.com or P.O. Box 100071, Denver, CO 80250.
          </b>
        </span>
      </p>
      <p>NOTICE TO CUSTOMER</p>
      <p>(a) DO NOT SIGN THIS BEFORE YOU READ IT, EVEN IF OTHERWISE ADVISED.</p>
      <p>(b) DO NOT SIGN THIS IF IT CONTAINS ANY BLANK SPACES.</p>
      <p>(c) YOU ARE ENTITLED TO AN EXACT COPY OF ANY AGREEMENT YOU SIGN.</p>
      <p>
        (d) YOU HAVE THE RIGHT AT ANY TIME TO PAY IN ADVANCE THE UNPAIDBALANCE
        DUE UNDER THIS AGREEMENT AND YOU MAY BE ENTITLED TO APARTIAL REFUND OF
        THE FINANCE CHARGE.
      </p>
      <p>
        CAUTION -- IT IS IMPORTANT THAT YOU THOROUGHLY READ THE CONTRACT BEFORE
        YOU SIGN IT.
      </p>
    </Wrapper>
  );
};

export default Agreement;
