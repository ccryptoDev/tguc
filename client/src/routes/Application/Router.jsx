import React from "react";
import { Route, Switch, useParams } from "react-router-dom";
import { routes as route } from "./routes";
import NotFound from "../../pages/application/notfound";
import { UserProvider } from "../../contexts/user";
import ApplyBorrower from "../../pages/application/borrowersApplication";
import ApplyContractor from "../../pages/application/contractorsApplication";
import GetStarted from "../../pages/application/getStarted";
import {
  PrivacyPolicy,
  PrivacyNote,
  Econsent,
  TermsAndConditions,
} from "../../pages/application/policies";
import Kukun from "../../pages/application/kukun";
import LoginRedirect from "../../pages/application/login";

const Routes = () => {
  const params = useParams();
  return (
    <UserProvider applicationId={params.id}>
      <Switch>
        <Route exact path={route.LOGIN} component={LoginRedirect} />
        <Route path={route.HOME} exact component={GetStarted} />
        <Route
          path={route.APPLY_BORROWER_AUTHORIZED}
          exact
          component={ApplyBorrower}
        />
        <Route path={route.APPLY_BORROWER} exact component={ApplyBorrower} />
        <Route
          path={route.APPLY_CONTRACTOR_AUTHORIZED}
          exact
          component={ApplyContractor}
        />
        <Route
          path={route.APPLY_CONTRACTOR}
          exact
          component={ApplyContractor}
        />
        <Route path={route.KUKUN} exact component={Kukun} />
        <Route path={route.PRIVACY_POLICY} exact component={PrivacyPolicy} />
        <Route path={route.PRIVACY_NOTE} exact component={PrivacyNote} />
        <Route path={route.ECONSENT} exact component={Econsent} />
        <Route
          path={route.TERMS_AND_CONDITIONS}
          exact
          component={TermsAndConditions}
        />
        <Route component={NotFound} />
      </Switch>
    </UserProvider>
  );
};

export default Routes;
