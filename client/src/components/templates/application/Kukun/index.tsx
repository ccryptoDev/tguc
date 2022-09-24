import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import IframeResizer from "iframe-resizer-react";
import styled from "styled-components";
import { routes } from "../../../../routes/Application/routes";
import { initKukun } from "./config";
import Loader from "../../../molecules/Loaders/LoaderWrapper";

export interface IKukunPayload {
  estimatedProjectCost: number;
  estimationDate: string;
  estimationType: string;
  projectName: string;
  userZipCode: string;
}

const Wrapper = styled.div`
  margin: 50px auto;
  max-width: 1180px;
  min-height: 900px;
  & iframe {
    border: none;
  }
`;

const NavButton = styled(Link)`
  background: var(--color-blue-1);
  color: #fff;
  margin: 30px auto;
  cursor: pointer;
  max-width: 370px;
  height: 44px;
  padding: 6px 0;
  font-weight: 500;
  border-radius: 3px;
  font-size: 2rem;
  text-decoration: none;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;

  @media screen and (max-width: 400px) {
    margin: 20px 10px;
    padding: 10px;
    height: auto;
  }
`;

const kukunUrl = "https://qasservices-tguc.mykukun.com/src/kw-prep-to-sell.php";

const Kukun = () => {
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const iframe = useRef<any>(null);

  useEffect(() => {
    if (window.localStorage.getItem("estimator")) {
      window.localStorage.removeItem("estimator");
    }
    if (iframe) {
      const jqueryLib = document.createElement("script");
      const kukunExternal = document.createElement("script");
      const iframeResizer = document.createElement("script");
      jqueryLib.setAttribute(
        "src",
        "https://qasservices-pnc.mykukun.com/bower_components/jquery/dist/jquery.min.js"
      );
      kukunExternal.setAttribute(
        "src",
        "https://qasservices-pnc.mykukun.com/js/kukunExternal.js"
      );
      iframeResizer.setAttribute(
        "src",
        "https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.1.1/iframeResizer.min.js"
      );
      jqueryLib.setAttribute("sync", "true");
      iframeResizer.setAttribute("sync", "true");
      kukunExternal.setAttribute("sync", "true");
      initKukun();
      const bodyElem = document.body;

      // load scripts in sequence
      bodyElem.append(jqueryLib);
      jqueryLib.onload = () => {
        bodyElem.append(iframeResizer);
        iframeResizer.onload = () => {
          bodyElem.append(kukunExternal);
        };
      };

      window.addEventListener("message", function (e) {
        if (
          e.origin === "https://qas-services-tguc.mykukun.com" &&
          e.data.payload
        ) {
          window.localStorage.setItem(
            "estimator",
            JSON.stringify(e.data.payload)
          );
          setCompleted(true);
        }
      });
      return () => {
        jqueryLib.remove();
        kukunExternal.remove();
        iframeResizer.remove();
      };
    }
    return () => {};
  }, [iframe.current]);

  return (
    <Wrapper>
      <Loader loading={loading}>
        <IframeResizer
          id="kukun_estimator"
          width="100%"
          height="auto"
          role="presentation"
          src={kukunUrl}
          ref={iframe}
          onLoad={() => setLoading(false)}
          title="Estimator widget"
          aria-label="Home Renovation Calculator"
          scrolling={false}
          frameBorder="0"
          log={false}
          checkOrigin={false}
        />
      </Loader>
      {!loading && (
        <NavButton to={routes.APPLY_BORROWER}>
          {completed ? "Next" : "Skip Directly to Credit Application"}
        </NavButton>
      )}
    </Wrapper>
  );
};

export default Kukun;
