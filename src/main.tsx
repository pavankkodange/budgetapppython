import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import "./styles/mobile-optimizations.css";

// Fix for mobile viewport height issues
function setVhProperty() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Set the property initially
setVhProperty();

// Update on resize and orientation change
window.addEventListener('resize', setVhProperty);
window.addEventListener('orientationchange', setVhProperty);

createRoot(document.getElementById("root")!).render(<App />);