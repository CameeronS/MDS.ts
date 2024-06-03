import { createContext, useEffect, useRef } from "react"
export const appContext = createContext({} as any)
import { MDS } from "../../../index"

const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const loaded = useRef<boolean>(false)

  useEffect(() => {
    MDS.init((msg) => {
      if (msg.event === "inited") {
        MDS.log("MDS initialized testinga")
      }

      MDS.log("MDS initialized testingb" + JSON.stringify(msg))

      MDS.cmd({
        command: "block",
        params: null,
        callback: (msg) => {
          MDS.log("MDS initialized testingc" + JSON.stringify(msg))
          loaded.current = true
        },
      })
    })
  }, [])
  return (
    <appContext.Provider value={{ loaded: loaded.current }}>
      {children}
    </appContext.Provider>
  )
}

export default AppProvider
