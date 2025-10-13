import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root")!;

// For development mode - simple render
createRoot(rootElement).render(<App />);
