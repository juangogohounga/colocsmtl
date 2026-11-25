import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App.jsx";
import "@/index.css";

// StrictMode is left off: it runs every page's data loading twice in development,
// which would double the compatibility requests sent to Claude.
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
