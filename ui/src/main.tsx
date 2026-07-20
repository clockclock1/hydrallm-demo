import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const root = createRoot(document.getElementById("root")!);

import("./App").then(({ default: App }) => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
