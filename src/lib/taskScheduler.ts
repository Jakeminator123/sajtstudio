/**
 * Task scheduler utilities for breaking up long tasks (>50ms)
 * to maintain 60fps performance
 */

interface RequestIdleCallbackOptions {
  timeout?: number
}

interface RequestIdleCallbackHandle {
  value: number
}

interface WindowWithIdleCallback extends Omit<
  Window,
  'cancelIdleCallback' | 'requestIdleCallback'
> {
  requestIdleCallback(
    callback: () => void,
    options?: RequestIdleCallbackOptions
  ): RequestIdleCallbackHandle
  cancelIdleCallback(handle: RequestIdleCallbackHandle): void
}

/**
 * Yield to the browser to prevent blocking the main thread
 * Uses requestIdleCallback if available, otherwise setTimeout(0)
 */
export function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve()
      return
    }

    if ('requestIdleCallback' in window) {
      ;(window as unknown as WindowWithIdleCallback).requestIdleCallback(() => resolve(), {
        timeout: 5,
      })
    } else {
      setTimeout(() => resolve(), 0)
    }
  })
}

/**
 * Process items in chunks with yields between chunks
 * Prevents long tasks that block the main thread
 */
export async function processInChunks<T>(
  items: T[],
  processor: (item: T, index: number) => void,
  chunkSize: number = 10,
  yieldAfter: number = 50 // ms - yield if processing takes longer than this
): Promise<void> {
  const startTime = performance.now()

  for (let i = 0; i < items.length; i++) {
    processor(items[i], i)

    // Yield every chunkSize items or if we've been running too long
    if ((i + 1) % chunkSize === 0 || performance.now() - startTime > yieldAfter) {
      await yieldToBrowser()
    }
  }
}

/**
 * Schedule a task to run during idle time
 * Falls back to setTimeout if requestIdleCallback is not available
 */
export function scheduleIdleTask(
  callback: () => void,
  options?: RequestIdleCallbackOptions
): number {
  if (typeof window === 'undefined') {
    return 0
  }

  if ('requestIdleCallback' in window) {
    return (window as unknown as WindowWithIdleCallback).requestIdleCallback(callback, options)
      .value
  } else {
    return setTimeout(callback, 0) as unknown as number
  }
}

/**
 * Cancel an idle task
 */
export function cancelIdleTask(id: number): void {
  if (typeof window === 'undefined') return

  if ('cancelIdleCallback' in window) {
    ;(window as unknown as WindowWithIdleCallback).cancelIdleCallback({
      value: id,
    })
  } else {
    clearTimeout(id)
  }
}

/**
 * Measure task duration and warn if it exceeds threshold
 */
export function measureTask<T>(name: string, task: () => T, threshold: number = 50): T {
  const start = performance.now()
  const result = task()
  const duration = performance.now() - start

  if (
    duration > threshold &&
    typeof window !== 'undefined' &&
    process.env.NODE_ENV === 'development'
  ) {
    console.warn(
      `[Performance] Task "${name}" took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`
    )
  }

  return result
}

/**
 * Async version of measureTask
 */
export async function measureTaskAsync<T>(
  name: string,
  task: () => Promise<T>,
  threshold: number = 50
): Promise<T> {
  const start = performance.now()
  const result = await task()
  const duration = performance.now() - start

  if (
    duration > threshold &&
    typeof window !== 'undefined' &&
    process.env.NODE_ENV === 'development'
  ) {
    console.warn(
      `[Performance] Task "${name}" took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`
    )
  }

  return result
}
