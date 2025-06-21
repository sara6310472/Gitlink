import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App";
import "./style/main.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
