import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const root = createRoot(document.getElementById("root")!);

const isSharedLiveStatus = /^\/share\/live-status\/[^/]+\/?$/.test(window.location.pathname);
const appModule = isSharedLiveStatus ? import('./SharedLiveStatusApp') : import('./App');

appModule.then(({ default: App }) => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
