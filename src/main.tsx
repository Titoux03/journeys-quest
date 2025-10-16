import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";
import { registerSW } from 'virtual:pwa-register';

// Register service worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Nouvelle version disponible. Recharger pour mettre à jour ?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('Journeys est prêt à fonctionner hors ligne');
  },
});

createRoot(document.getElementById("root")!).render(<App />);
