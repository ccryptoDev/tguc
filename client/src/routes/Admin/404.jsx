import React from "react";
import { Redirect } from "react-router-dom";
import { routes } from "./routes.config";

const NoFound = () => {
  return <Redirect to={routes.DASHBOARD} />;
};

export default NoFound;
