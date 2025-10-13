import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { OneSignalInit } from "./components/OneSignalInit";

const rootElement = document.getElementById("root")!;

// For development mode - simple render
createRoot(rootElement).render(
  <>
    <OneSignalInit />
    <App />
  </>
);
