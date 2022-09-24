import React, { useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, Slide } from "react-toastify";
import Router from "./routes";
import GlobalStyle from "./styles/GlobalStyles";
import { argyleScript } from "./utils/argyle";

const App = () => {
  useEffect(() => {
    argyleScript(); // connect argyle app
  }, []);
  return (
    <div className="App">
      <GlobalStyle />
      <ToastContainer
        position="bottom-right"
        autoClose={2500}
        hideProgressBar
        closeOnClick
        rtl={false}
        draggable
        pauseOnHover
        transition={Slide}
      />

      <Router />
    </div>
  );
};

export default App;
