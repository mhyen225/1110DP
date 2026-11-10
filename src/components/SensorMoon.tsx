import type { CSSProperties } from "react"
import { SENSOR_MAX, SENSOR_MIN, SENSOR_THRESHOLD } from "../product"

type SensorMoonProps = {
  value?: number
}

export function SensorMoon({ value }: SensorMoonProps) {
  const hasItems = value !== undefined && value >= SENSOR_THRESHOLD
  const level =
    value === undefined
      ? 0
      : Math.min(1, Math.max(0, (value - SENSOR_MIN) / (SENSOR_MAX - SENSOR_MIN)))
  const moonStyle: CSSProperties & { "--level": number } = { "--level": level }
  const valueLabel = value === undefined ? "—" : value.toLocaleString("ko-KR")
  const stateLabel =
    value === undefined
      ? "달 꺼짐"
      : hasItems
        ? "달 밝기 100%"
        : "달 밝기 0%"

  return (
    <section className="lamp-section" aria-label="달 상태">
      <div
        className="moon"
        data-power={hasItems ? "on" : "off"}
        role="img"
        aria-label={stateLabel}
        style={moonStyle}
      >
        <img
          src={
            hasItems
              ? `${import.meta.env.BASE_URL}images/remember-lamp-on.webp`
              : `${import.meta.env.BASE_URL}images/remember-lamp-off.webp`
          }
          alt=""
        />
      </div>
      <p className="t-value sensor-value">{valueLabel}</p>
      <p className="t-label presence-state">
        {value === undefined ? "센서 값 대기 중" : hasItems ? "물건 있음" : "물건 없음"}
      </p>
    </section>
  )
}
