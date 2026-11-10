import { useCallback, useEffect, useState } from "react"
import { ConnectionControl } from "./components/ConnectionControl"
import { PowerToggle } from "./components/PowerToggle"
import { ProductHeader } from "./components/ProductHeader"
import { SensorChart } from "./components/SensorChart"
import { SensorMoon } from "./components/SensorMoon"
import {
  connectSensor,
  disconnectSensor,
  loadPower,
  type Reading,
  type Status,
} from "./lib/device"
import { IS_DEMO } from "./lib/supabase"
import { MAX_POINTS } from "./product"

export default function App() {
  const [status, setStatus] = useState<Status>("disconnected")
  const [power, setPower] = useState(false)
  const [readings, setReadings] = useState<Reading[]>([])

  const handleReading = useCallback((reading: Reading) => {
    setReadings((current) => [...current, reading].slice(-MAX_POINTS))
  }, [])

  const handleConnect = useCallback(() => {
    void connectSensor({
      onInit: setReadings,
      onReading: handleReading,
      onStatus: setStatus,
    })
  }, [handleReading])

  const handleDisconnect = useCallback(() => {
    void disconnectSensor().then(() => setStatus("disconnected"))
  }, [])

  useEffect(() => {
    void loadPower().then(setPower)
    if (IS_DEMO) handleConnect()
    return () => {
      void disconnectSensor()
    }
  }, [handleConnect])

  const latestValue = readings.at(-1)?.value

  return (
    <main className="app-shell">
      <ProductHeader demo={IS_DEMO} />
      <SensorMoon value={latestValue} />
      <div className="lower-grid">
        <section className="controls" aria-label="기기 제어">
          <ConnectionControl
            status={status}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
          <PowerToggle power={power} onChange={setPower} />
        </section>
        <SensorChart readings={readings} />
      </div>
    </main>
  )
}
