import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import AppGate from "./AppGate";
import "./styles/global.css";
import { MeProvider } from "./store/MeContext";
import { initTelegram } from "./telegram";

initTelegram();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <MeProvider>
        <AppGate />
      </MeProvider>
    </HashRouter>
  </React.StrictMode>
);
