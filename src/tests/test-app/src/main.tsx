import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import AppProvider from "./AppContext.tsx"
import { MDS } from "../../../index"

// Dev Settings
MDS.DEBUG_HOST = "127.0.0.1"
MDS.DEBUG_PORT = 9003
MDS.DEBUG_MINIDAPPID =
  "0xF84BA7B31C93F0F79756453B8974DAEE146EC8F432C62B95BD165D7234A09146F00F564813064064519382A5613BB825CC87E481F4E297F75CCA8887C41ECD7E335D8D6F89A08D19C36DC3DA45F0C957D1A8026B883CD277BBB08C9A9232991ADD3810A5FCA3D99181CB7F223333E70F70EB718BD5F0B1E3A0A983E8A31A7D54"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
)
