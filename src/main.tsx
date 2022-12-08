import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import enUS from "antd/es/locale/en_US";
import "antd/dist/reset.css";
import "./index.css";
import { ConfigProvider } from "antd";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider locale={enUS}>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
);
