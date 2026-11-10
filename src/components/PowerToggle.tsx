import { useState } from "react"
import { setLedPower } from "../lib/device"

type PowerToggleProps = {
  power: boolean
  onChange: (power: boolean) => void
}

export function PowerToggle({ power, onChange }: PowerToggleProps) {
  const [failed, setFailed] = useState(false)

  const togglePower = async () => {
    const previous = power
    const next = !power
    setFailed(false)
    onChange(next)
    const success = await setLedPower(next)
    if (!success) {
      onChange(previous)
      setFailed(true)
    }
  }

  return (
    <div>
      <div className="control-row">
        <div>
          <p className="t-label">LED 전원</p>
          <p className="t-caption muted">{power ? "켜짐" : "꺼짐"}</p>
        </div>
        <button
          className="power-switch"
          type="button"
          role="switch"
          aria-checked={power}
          aria-label="LED 전원"
          onClick={togglePower}
        >
          <span aria-hidden="true" />
        </button>
      </div>
      {failed && (
        <p className="t-caption power-error" role="alert">
          전원 변경 실패, 다시 시도
        </p>
      )}
    </div>
  )
}
