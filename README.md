# @user-xxy/vue-hooks

Composition-API hooks for Vue 3.

```bash
pnpm add @user-xxy/vue-hooks
# peerDeps
pnpm add vue
```

## API

### `useIsMobile(maxWidth?)`

Reactive viewport flag.

```ts
import { useIsMobile } from '@user-xxy/vue-hooks'

const isMobile = useIsMobile()    // default threshold 768
watch(isMobile, (m) => console.log(m ? 'mobile' : 'desktop'))
```

### `useToggle(initial?)` / `createSharedToggle(initial?)`

`useToggle` returns a local boolean ref + setters.
`createSharedToggle` returns a factory that gives every caller the same ref —
ideal for global states like a collapsed sidebar.

```ts
const { value, toggle } = useToggle(false)

// shared
export const useSidebar = createSharedToggle(false)
// somewhere else:
const { value: collapsed, toggle } = useSidebar()
```

### `useWebSocket(options)`

WebSocket client with heartbeat & auto-reconnect.

```ts
const { status, data, send, close } = useWebSocket<ChatMessage, ChatPayload>({
  url: 'wss://chat.example.com',
  heartbeatInterval: 30_000,
  heartbeatMessage: () => JSON.stringify({ event: 'ping' }),
  onOpen: () => send({ event: 'login', token }),
  onMessage: (msg) => console.log(msg),
})
```

Options: `url`, `protocols`, `immediate`, `autoReconnect`, `reconnectInterval`,
`reconnectAttempts`, `heartbeatInterval`, `heartbeatMessage`, `parse`,
`serialize`, `onOpen` / `onClose` / `onError` / `onMessage`.

### `useCountdown(durationMs, options?)`

```ts
const { remaining, isFinished, start, stop, reset } = useCountdown(60_000, {
  interval: 1000,
  onFinish: () => console.log('done'),
})
```

### `useLatencyColor(latency)`

```ts
const latency = ref(120)
const color = useLatencyColor(latency)   // computed<string>
```

### `useLocalStorage(key, defaultValue)`

```ts
const token = useLocalStorage<string>('token', '')
token.value = 'abc'  // persisted
```

## License

MIT
