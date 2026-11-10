import { useEffect, useRef, useState } from "react"
import type { Reading } from "../lib/device"
import { SENSOR_MAX } from "../product"

type SensorChartProps = {
  readings: Reading[]
}

const HEIGHT = 200
const LEFT = 40
const RIGHT = 8
const TOP = 8
const BOTTOM = 20

export function SensorChart({ readings }: SensorChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(320)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(1, Math.round(entry.contentRect.width)))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  if (readings.length === 0) {
    return (
      <section className="chart-section" aria-label="실시간 센서값">
        <p className="t-body chart-empty">
          센서를 연결하면 값이 여기에 그려집니다.
        </p>
      </section>
    )
  }

  const plotWidth = Math.max(1, width - LEFT - RIGHT)
  const plotHeight = HEIGHT - TOP - BOTTOM
  const points = readings
    .map((reading, index) => {
      const x =
        LEFT +
        (readings.length === 1
          ? plotWidth
          : (index / (readings.length - 1)) * plotWidth)
      const y = TOP + (1 - reading.value / SENSOR_MAX) * plotHeight
      return `${x},${y}`
    })
    .join(" ")
  const current = readings.at(-1)?.value ?? 0
  const ticks = [SENSOR_MAX, Math.round(SENSOR_MAX / 2), 0]

  return (
    <section className="chart-section" aria-label="실시간 센서값">
      <div ref={containerRef} className="chart-container">
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={`센서값 추이, 현재 ${current.toLocaleString("ko-KR")}`}
        >
          {ticks.map((tick, index) => {
            const y = TOP + (index / 2) * plotHeight
            return (
              <g key={tick}>
                <line
                  className="chart-grid"
                  x1={LEFT}
                  x2={width - RIGHT}
                  y1={y}
                  y2={y}
                />
                <text
                  className="chart-label"
                  x={LEFT - 8}
                  y={y + 4}
                  textAnchor="end"
                >
                  {tick.toLocaleString("ko-KR")}
                </text>
              </g>
            )
          })}
          <polyline className="chart-line" points={points} />
          <text className="chart-label" x={LEFT} y={HEIGHT - 2}>
            −60s
          </text>
          <text
            className="chart-label"
            x={width - RIGHT}
            y={HEIGHT - 2}
            textAnchor="end"
          >
            지금
          </text>
        </svg>
      </div>
    </section>
  )
}
