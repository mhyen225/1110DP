import { SENSOR_THRESHOLD } from "../product"

type SensorMoonProps = {
  value?: number
}

export function SensorMoon({ value }: SensorMoonProps) {
  const hasItems = value !== undefined && value >= SENSOR_THRESHOLD
  const valueLabel = value === undefined ? "—" : value.toLocaleString("ko-KR")
  const stateLabel =
    value === undefined
      ? "센서 값 대기 중, 램프 꺼짐"
      : hasItems
        ? "물건 있음, 램프 켜짐"
        : "물건 없음, 램프 꺼짐"

  return (
    <section className="lamp-section" aria-label="램프 상태">
      <div className="lamp-visual" role="img" aria-label={stateLabel}>
        <img
          src={
            hasItems
              ? "/images/remember-lamp-on.webp"
              : "/images/remember-lamp-off.webp"
          }
          alt=""
        />
      </div>
      <p className="t-value sensor-value">{valueLabel}</p>
      <p className="t-label presence-state">{stateLabel}</p>
    </section>
  )
}
