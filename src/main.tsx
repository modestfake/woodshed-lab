import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "@/components/theme-provider";
import { PaletteProvider } from "@/components/palette-provider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <PaletteProvider>
        <App />
      </PaletteProvider>
    </ThemeProvider>
  </StrictMode>,
);
