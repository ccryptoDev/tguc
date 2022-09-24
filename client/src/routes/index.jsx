import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import StyleGuide from "../components/style-guide";
import Progress from "../pages/application/progress";
import Landing from "./Landing";

const BorrowerRoutes = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./Borrower/Router")), 1000);
  });
});
const ApplicationRoutes = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./Application/Router")), 1000);
  });
});
const AdminApp = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./Admin/Router")), 1000);
  });
});

const Routes = () => {
  return (
    <Router>
      <Suspense fallback={<Progress />}>
        <Switch>
          <Route path="/admin" component={AdminApp} />
          <Route path="/borrower" component={BorrowerRoutes} />
          <Route path="/application" component={ApplicationRoutes} />
          <Route path="/guide" component={StyleGuide} />
          <Route path="/" component={Landing} />
        </Switch>
      </Suspense>
    </Router>
  );
};

export default Routes;
