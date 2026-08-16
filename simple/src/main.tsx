import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TransactionProvider } from "@/contexts/TransactionContext";

import "./styles/index.css";
import AppLayout from "@/App.tsx";
import SourcePage from "@/pages/SourcePage";
import MappingPage from "@/pages/MappingPage";

const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("Unable to find the root application element.");
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <TransactionProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={null} />
              <Route path="source" element={<SourcePage />} />
              <Route path="mapping" element={<MappingPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TransactionProvider>
    </ThemeProvider>
  </StrictMode>,
);
