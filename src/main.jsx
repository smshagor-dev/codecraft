import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import App from "./App.jsx";
import { modernTheme } from "./theme/modernTheme";
import "./styles/stackblitz.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider theme={modernTheme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
