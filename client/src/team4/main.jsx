import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Team4 from "./Index";
createRoot(document.getElementById("root")).render(
  <StrictMode><BrowserRouter><Team4 /></BrowserRouter></StrictMode>
);
