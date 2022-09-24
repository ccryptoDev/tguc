import React from "react";
import styled from "styled-components";
import { Text, H2, H4 } from "../../../components/atoms/Typography";

const Wrapper = styled.section`
  ol,
  ul {
    padding-left: 16px;
  }
  & > ol,
  & .procedureForArbitration {
    & > li {
      margin: 24px 0;
    }
  }

  .consentToArbitration {
    & ol {
      li {
        font-weight: 700;
      }
    }
  }
`;

const NoticeOfArbitration = styled.div`
  padding: 24px;
  border: 1px solid var(--color-gray-2);
  ul {
    margin: 24px 0;
  }
`;

function ArbitrationAgreement() {
  return (
    <Wrapper>
      <H2 className="mb-24">Arbitration agreement</H2>
      <NoticeOfArbitration>
        <H4>Notice of arbitration agreement</H4>
        <Text>
          This Arbitration Agreement provides that all disputes between you and
          Pompeii Surgical will be resolved by <b>BINDING ARBITRATION</b>. You
          thus
          <b>GIVE UP YOUR RIGHT TO GO TO COURT</b> to assert or defend your
          rights under this contract (except for matters that may be taken to
          Small Claims Court and except for matters seeking public injunctive
          relief).
        </Text>
        <ul>
          <li>
            <Text>
              Your rights will be determined by a NEUTRAL ARBITRATOR and NOT a
              judge or jury.
            </Text>
          </li>
          <li>
            <Text>
              You are entitled to a FAIR HEARING, BUT the arbitration procedures
              are SIMPLER AND MORE LIMITED THAN RULES APPLICABLE IN COURT.
            </Text>
          </li>
          <li>
            <Text>
              Arbitrator decisions are as enforceable as any court order and are
              subject to VERY LIMITED REVIEW BY A COURT.
            </Text>
          </li>
        </ul>
      </NoticeOfArbitration>
      <Text className="mtb-24">
        <b>
          For more details, please read this arbitration agreement carefully.
        </b>
      </Text>
      <ol>
        <li>
          <Text>
            <b>Dispute Resolution by Arbitration:</b>
            Any and all claims, controversies, or disputes arising out of or
            related in any way to your Retail Installment Sales Agreement
            Truth-in-Lending Disclosure, (the &quot;Service Agreement&quot;)
            entered into by you and us on the same date as this Arbitration
            Agreement shall be subject to binding arbitration pursuant to the
            under the Federal Arbitration Act. This Arbitration Agreement is
            made pursuant to a transaction involving interstate commerce, and
            shall be govemed by the Federal Arbitration Act (the
            &quot;FAA&quot;), 9 U.S.C. Sections 1-6. This Agreement applies to,
            without limitation, (1) all issues concerning the transaction in
            connection with which this Arbitration Agreement has been executed;
            (2) initial claims, counterclaims, cross-claims, and third-party
            claims, whether arising in law or equity, and whether based upon
            federal, state, or local law; contract; tort; fraud or other
            intentional tort; constitution, common law, or statute; (3) any
            issue as to whether any such claims, controversies, or disputes are
            subject to arbitration; and (4) any claims, controversies, or
            disputes that would otherwise be subject to class actions. This
            means that all claims, controversies or disputes that are the
            subject of class actions will also be subject to binding arbitration
            under the FAA and this Arbitration Agreement. THE ARBITRATOR SHALL
            NOT CONDUCT CLASS ARBITRATION; THAT IS, THE ARBITRATOR SHALL NOT
            ALLOW YOU OR US TO SERVE AS A PRIVATE ATTORNEY GENERAL, AS A
            REPRESENTATIVE, OR IN ANY OTHER REPRESENTATIVE CAPACITY FOR OTHERS
            IN THE ARBITRATION.
          </Text>
        </li>
        <li className="consentToArbitration">
          <Text>
            <b>Consent to Arbitration:</b>
            You and we understand and agree that you and we are choosing
            arbitration rather than litigation to resolve disputes. You and we
            understand that you and we have the right to litigate disputes but
            that you and we prefer to do so through arbitration. In arbitration,
            you may choose to have a hearing and be represented by counsel.
            <b>
              THEREFORE, YOU UNDERSTAND THAT BY ENTERING INTO THIS ARBITRATION
              AGREEMENT, YOU VOLUNTARILY AND KNOWINGLY:
            </b>
          </Text>
          <ol type="a">
            <li>
              <Text>
                <b>
                  WAIVE ANY RIGHTS TO HAVE A TRIAL BY JURY TO RESOLVE ANY CLAIM
                  OR DISPUTE ALLEGED AGAINST US OR RELATED THIRD PARTIES;
                </b>
              </Text>
            </li>
            <li>
              <Text>
                <b>
                  WAIVE YOUR RIGHT TO HAVE A COURT, OTHER THAN A SMALL CLAIMS
                  COURT, RESOLVE ANY CLAIM OR DISPUTE ALLEGED AGAINST US OR
                  RELATED THIRD PARTIES; AND
                </b>
              </Text>
            </li>
            <li>
              <Text>
                <b>
                  TO THE EXTENT PERMITTED BY APPLICABLE LAW, WAIVE YOUR RIGHT TO
                  SERVE AS A REPRESENTATIVE, AS A PRIVATE ATTORNEY GENERAL, OR
                  IN ANY OTHER REPRESENTATIVE CAPACITY, AND/OR TO PARTICIPATE AS
                  A MEMBER OF A CLASS OF CLAIMANTS, IN ANY LAWSUIT FILED AGAINST
                  US AND/OR RELATED THIRD PARTIES.
                </b>
              </Text>
            </li>
          </ol>
        </li>
        <li>
          <Text>
            <b>Exception for Claims for Public Injunctive Relief:</b>
            You or we may, but are not required to, submit claims for public
            injunctive relief under state or federal statutes that specifically
            provide for such relief to arbitration under this Arbitration
            Agreement. In the event that either you or we elect to pursue such a
            claim through court proceedings, all other claims between us shall
            remain subject to the provisions of this Arbitration Agreement.
          </Text>
        </li>
        <li>
          <Text>
            <b>Opt-Out Right:</b>
            You may elect to opt out of this Arbitration Agreement by doing any
            of the following things: In the signature block at the end of this
            Arbitration Agreement, writing &quot;Opt Out&quot; in the signature
            block and initialing it; or Sending or delivering written notice to
            the address on this Arbitration Agreement that you wish to opt out
            of this Arbitration Agreement. This written notice must be received
            by us by the end of the 30th calendar day after you sign this
            Agreement.
          </Text>
        </li>
        <li className="procedureForArbitration">
          <Text>
            <b>Procedure for Arbitration:</b>
          </Text>
          <ul>
            <li>
              <Text>
                Arbitration maybe heard, at the claimant&quot;s election, by:
                The American Arbitration Association:https://www.adr.org(877)
                495-4185casefiling@adr.org
              </Text>
            </li>
            <li>
              <Text>
                {" "}
                JAMS: (800)
                352-5267http://www.jamsadr.com/adr-arbitrationhttps://www.jamsadr.com/contact
              </Text>
            </li>
            <li>
              <Text>
                or any other arbitration fonun as you and we may agree.
              </Text>
            </li>
          </ul>
          <Text className="mtb-24">
            You may initiate an arbitration by contacting the arbitration forum
            of your choice at the contact points provided above. If you require
            assistance in a language other than English, or special services to
            accommodate a disability, please select an arbitration forum that
            can accommodate your needs.
          </Text>
          <ol type="a">
            <li>
              <Text>
                The arbitration shall be conducted by a single neutral,
                qualified and competent arbitrator selected by you and us under
                the rules of the arbitration forum selected. The arbitrator
                shall apply applicable substantive law consistent with the FAA
                and applicable statutes of limitation, and shall honor all
                claims of privilege recognized by law. The Arbitration shall
                take place in a location determined by the arbitrator the
                federal district of your residence.
              </Text>
            </li>
            <li>
              <Text>
                If you file for arbitration under this Arbitration Agreement,
                the only fee you may required to pay is $200, which is
                approximately equivalent to current court filing fees. We will
                bear all other of the arbitration, except for your
                attorneys&quot; fees and costs. If we file for arbitration under
                this Arbitration Agreement, we will be required to pay all costs
                associated with the arbitration, except for your attorneys&quot;
                fees and costs. However, if circumstances relating to the
                dispute (including, among other things, the size and nature of
                the dispute, the nature of the services that we have provided
                you, and your ability to pay) it would be unfair or burdensome
                for you to pay the arbitration filing fees, we will advance the
                initial filing, administration, and hearing fees required by the
                arbitrator, who will ultimately decide who will be responsible
                for paying those amounts.
              </Text>
            </li>
            <li>
              <Text>
                You can participate without representation or may choose to be
                represented by an attorney or other authorized representative,
                unless that choice is prohibited by applicable law. Because
                arbitration is a final, legally-binding process that may impact
                your legal rights, you may want to consider consulting an
                attorney. Each party, you and we, shall bear our own costs and
                expenses, including attorneys&quot; fees, that we incur with
                respect to the arbitration.
              </Text>
            </li>
            <li>
              <Text>
                The Arbitrator shall allow for the discovery or exchange of
                non-privileged information relevant to the dispute, under the
                Arbitrator&quot;s supervision, prior to the arbitration hearing
                or submission of written presentations.
              </Text>
            </li>
            <li>
              <Text>
                Arbitrations may be decided upon written presentations, unless
                the amount of relief requested exceeds $25,000. The Arbitrator
                may consider dispositive motions, but shall generally hold a
                conference call among all the parties prior to permitting any
                written motion. The Arbitrator may hold hearings in person or by
                conference call, and hearings generally will not exceed one day.
                If you or we show good cause, the arbitrator may schedule
                additional hearings within seven calendar days after the initial
                hearing.
              </Text>
            </li>
          </ol>
        </li>
        <li>
          <Text>
            <b>Interpretation of this Arbitration Agreement:</b>
            Any dispute as to the arbitrability of a claim shall be decided by
            the arbitrator. Any dispute as to the validity of the portion of
            this agreement that prohibits class arbitration shall be a matter
            for resolution by a court and not by the arbitrator. In the event
            that the court deems the portion of this agreement that prohibits
            class arbitration to be unenforceable, then the court shall retain
            jurisdiction over the dispute and this Arbitration Agreement shall
            be null and void.
          </Text>
        </li>
        <li>
          <Text>
            <b>Statutes of Limitations:</b>
            All statutes of limitations that are applicable to any claim or
            dispute shall apply to any arbitration between you and us.
          </Text>
        </li>
        <li>
          <Text>
            <b>Attorneys&quot; Fees:</b>
            The arbitrator may, but is not required to, award reasonable
            expenses and attorneys&quot; fees to the prevailing party if allowed
            by statute or applicable law and by the rules of the arbitration
            forum.
          </Text>
        </li>
        <li>
          <Text>
            <b>Awards:</b>
            The Arbitrator shall issue the award in accordance with the rules of
            the arbitration forum. Unless you and we agree otherwise, The award
            shall provide the concise written reasons for the decision and shall
            apply any identified, pertinent contract terms, statutes and legal
            precedents. The arbitrator may grant any remedy, relief or outcome
            that you or we parties could have received in court.
          </Text>
        </li>
        <li>
          <Text>
            <b>Enforcement of Award:</b>
            The award of the arbitrator shall be binding and final after fifteen
            (15) days have passed, and judgment upon the arbitrator&quot;s award
            may thereafter be entered in any court having jurisdiction.
          </Text>
        </li>
        <li>
          <Text>
            <b>Appeal Procedure:</b>
            Within fifteen (15) days after an award by the arbitrator, any party
            may appeal the award by requesting in writing a new arbitration
            before a panel of three neutral arbitrators designated by the same
            arbitration service. The decision of the panel of three neutral
            arbitrators will be immediately binding and final.
          </Text>
        </li>
        <li>
          <Text>
            <b>Small Claims Court:</b>
            Notwithstanding any other provision of this Arbitration Agreement,
            either you or we shall retain the right to seek adjudication in
            Small Claims Court of any matter within its jurisdiction. Any matter
            not within the Small Claims Court&quot;s jurisdiction shall be
            resolved by arbitration as provided above. Any appeal from a Small
            Claims Court judgment shall be conducted in accordance with the
            provisions in Section 8 of this Arbitration Agreement or applicable
            law.
          </Text>
        </li>
        <li>
          <Text>
            <b> Counterparts: </b>
            This Arbitration Agreement may be executed in counterparts, each of
            which shall be deemed to be an original but all of which together
            shall be deemed to be one instrument.
          </Text>
        </li>
      </ol>
    </Wrapper>
  );
}

export default ArbitrationAgreement;
