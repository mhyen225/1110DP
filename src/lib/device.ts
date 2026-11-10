import type { RealtimeChannel } from "@supabase/supabase-js"
import { DEVICE_ID, MAX_POINTS, SENSOR_MAX, SENSOR_MIN } from "../product"
import { db, IS_DEMO } from "./supabase"

export interface Reading {
  value: number
  created_at: string
}
export type Status = "disconnected" | "connecting" | "connected" | "error"

type ConnectOptions = {
  onInit: (rows: Reading[]) => void
  onReading: (row: Reading) => void
  onStatus: (status: Status) => void
}

let channel: RealtimeChannel | null = null
let demoTimer: ReturnType<typeof setInterval> | null = null
let demoStep = 0
let session = 0

const demoValue = (step: number) => {
  const center = (SENSOR_MAX + SENSOR_MIN) / 2
  const amplitude = (SENSOR_MAX - SENSOR_MIN) * 0.42
  return Math.round(center + Math.sin(step / 8) * amplitude)
}

export async function connectSensor({
  onInit,
  onReading,
  onStatus,
}: ConnectOptions): Promise<void> {
  const currentSession = ++session
  await clearConnection()
  if (currentSession !== session) return
  onStatus("connecting")

  if (IS_DEMO) {
    const now = Date.now()
    demoStep = 0
    const initial = Array.from({ length: 24 }, (_, index) => {
      demoStep = index
      return {
        value: demoValue(index),
        created_at: new Date(now - (23 - index) * 500).toISOString(),
      }
    })
    onInit(initial)
    onStatus("connected")
    demoTimer = setInterval(() => {
      if (currentSession !== session) return
      demoStep += 1
      onReading({
        value: demoValue(demoStep),
        created_at: new Date().toISOString(),
      })
    }, 500)
    return
  }

  if (!db) {
    onStatus("error")
    return
  }

  const { data, error } = await db
    .from("sensor_readings")
    .select("value, created_at")
    .eq("device_id", DEVICE_ID)
    .order("created_at", { ascending: false })
    .limit(MAX_POINTS)

  if (currentSession !== session) return
  if (error) {
    onStatus("error")
    return
  }

  onInit((data as Reading[]).reverse())
  channel = db
    .channel(`sensor:${DEVICE_ID}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "sensor_readings",
        filter: `device_id=eq.${DEVICE_ID}`,
      },
      (payload) => {
        if (currentSession === session) onReading(payload.new as Reading)
      },
    )
    .subscribe((state) => {
      if (currentSession !== session) return
      if (state === "SUBSCRIBED") onStatus("connected")
      if (state === "CHANNEL_ERROR" || state === "TIMED_OUT") onStatus("error")
    })
}

export async function disconnectSensor(): Promise<void> {
  session += 1
  await clearConnection()
}

async function clearConnection(): Promise<void> {
  if (demoTimer) {
    clearInterval(demoTimer)
    demoTimer = null
  }
  if (channel && db) {
    await db.removeChannel(channel)
    channel = null
  }
}

export async function setLedPower(on: boolean): Promise<boolean> {
  if (IS_DEMO) return true
  if (!db) return false
  const { error } = await db
    .from("device_state")
    .update({ led_on: on, updated_at: new Date().toISOString() })
    .eq("device_id", DEVICE_ID)
  return !error
}

export async function loadPower(): Promise<boolean> {
  if (IS_DEMO) return true
  if (!db) return false
  const { data, error } = await db
    .from("device_state")
    .select("led_on")
    .eq("device_id", DEVICE_ID)
    .single()
  return error ? false : Boolean(data.led_on)
}
