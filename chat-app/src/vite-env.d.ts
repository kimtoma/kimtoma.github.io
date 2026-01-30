/// <reference types="vite/client" />

// View Transition API types
interface ViewTransition {
  ready: Promise<void>
  finished: Promise<void>
  updateCallbackDone: Promise<void>
  skipTransition(): void
}

interface Document {
  startViewTransition?(callback: () => void | Promise<void>): ViewTransition
}
