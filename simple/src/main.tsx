import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/contexts/ThemeContext";

import "./styles/index.css";
import App from "@/App.tsx";

const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("Unable to find the root application element.");
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
