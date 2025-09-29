import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx"; // Make sure the path is correct
import "./index.css"; // Import Tailwind CSS

createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
