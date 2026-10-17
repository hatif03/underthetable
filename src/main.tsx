import "@fontsource-variable/geist"
import "@fontsource-variable/geist-mono"
import "@fontsource/press-start-2p"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"
import "./styles.css"

const root = document.getElementById("root")
if (!root) throw new Error("Missing root")
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
