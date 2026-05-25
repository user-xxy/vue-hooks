import { onBeforeUnmount, ref, shallowRef, type Ref, type ShallowRef } from 'vue'

export interface UseWebSocketOptions<TIn = unknown, TOut = unknown> {
  /** WebSocket URL. Required. */
  url: string
  /** Subprotocols passed to the WebSocket constructor. */
  protocols?: string | string[]
  /** Auto-connect on construction (default true). */
  immediate?: boolean
  /** Auto-reconnect after an unexpected close (default true). */
  autoReconnect?: boolean
  /** Reconnect delay in ms (default 2000). */
  reconnectInterval?: number
  /** Maximum reconnect attempts. `Infinity` by default. */
  reconnectAttempts?: number
  /** Heartbeat interval in ms. 0 disables. (default 60_000) */
  heartbeatInterval?: number
  /** Builder for the heartbeat payload (default `"ping"`). */
  heartbeatMessage?: () => string | ArrayBufferLike | Blob | ArrayBufferView
  /** Parse incoming raw data. Default: JSON.parse with string fallback. */
  parse?: (raw: string | ArrayBuffer | Blob) => TIn
  /** Serialise outgoing payload. Default: JSON.stringify for non-string. */
  serialize?: (value: TOut) => string | ArrayBufferLike | Blob | ArrayBufferView
  /** Lifecycle hooks. */
  onOpen?: (ws: WebSocket) => void
  onClose?: (event: CloseEvent) => void
  onError?: (event: Event) => void
  onMessage?: (data: TIn, raw: MessageEvent) => void
}

export type WsStatus = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED'

/**
 * A WebSocket client with auto-reconnect and heartbeat.
 *
 * @example
 * const { status, data, send, close } = useWebSocket<ChatMessage>({
 *   url: 'wss://chat.example.com',
 *   onMessage: (msg) => console.log(msg),
 * })
 * send({ type: 'login', token: 'xyz' })
 */
export function useWebSocket<TIn = unknown, TOut = unknown>(
  options: UseWebSocketOptions<TIn, TOut>,
): {
  status: Ref<WsStatus>
  data: Ref<TIn | null>
  ws: ShallowRef<WebSocket | null>
  send: (value: TOut) => boolean
  open: () => void
  close: (code?: number, reason?: string) => void
} {
  const {
    url,
    protocols,
    immediate = true,
    autoReconnect = true,
    reconnectInterval = 2000,
    reconnectAttempts = Infinity,
    heartbeatInterval = 60_000,
    heartbeatMessage = () => 'ping',
    parse = defaultParse as (raw: string | ArrayBuffer | Blob) => TIn,
    serialize = defaultSerialize as (v: TOut) => string,
    onOpen,
    onClose,
    onError,
    onMessage,
  } = options

  const status = ref<WsStatus>('CLOSED')
  const data = ref<TIn | null>(null) as Ref<TIn | null>
  const ws = shallowRef<WebSocket | null>(null)
  let attempts = 0
  let manuallyClosed = false
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null

  const stopHeartbeat = () => {
    if (heartbeatTimer) clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }

  const startHeartbeat = () => {
    stopHeartbeat()
    if (!heartbeatInterval) return
    heartbeatTimer = setInterval(() => {
      if (ws.value?.readyState === WebSocket.OPEN) {
        ws.value.send(heartbeatMessage())
      }
    }, heartbeatInterval)
  }

  const open = () => {
    if (ws.value && ws.value.readyState <= WebSocket.OPEN) return
    manuallyClosed = false
    status.value = 'CONNECTING'
    const socket = new WebSocket(url, protocols)
    ws.value = socket

    socket.onopen = () => {
      status.value = 'OPEN'
      attempts = 0
      startHeartbeat()
      onOpen?.(socket)
    }
    socket.onmessage = (event) => {
      try {
        const parsed = parse(event.data)
        data.value = parsed
        onMessage?.(parsed, event)
      } catch (err) {
        console.warn('[useWebSocket] failed to parse message:', err)
      }
    }
    socket.onerror = (event) => {
      onError?.(event)
    }
    socket.onclose = (event) => {
      stopHeartbeat()
      status.value = 'CLOSED'
      ws.value = null
      onClose?.(event)
      if (!manuallyClosed && autoReconnect && attempts < reconnectAttempts) {
        attempts++
        if (reconnectTimer) clearTimeout(reconnectTimer)
        reconnectTimer = setTimeout(open, reconnectInterval)
      }
    }
  }

  const close = (code?: number, reason?: string) => {
    manuallyClosed = true
    if (reconnectTimer) clearTimeout(reconnectTimer)
    stopHeartbeat()
    if (ws.value) {
      status.value = 'CLOSING'
      ws.value.close(code, reason)
    }
  }

  const send = (value: TOut): boolean => {
    if (ws.value?.readyState !== WebSocket.OPEN) return false
    ws.value.send(serialize(value))
    return true
  }

  if (immediate) open()
  onBeforeUnmount(() => close())

  return { status, data, ws, send, open, close }
}

function defaultParse(raw: unknown): unknown {
  if (typeof raw !== 'string') return raw
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

function defaultSerialize(value: unknown): string {
  return typeof value === 'string' ? value : JSON.stringify(value)
}
