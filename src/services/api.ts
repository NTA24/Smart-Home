/**
 * Public HTTP boundary for the app: re-exports default Axios instance, IoT parking APIs,
 * core resource APIs, and chat config. Implementation lives in `src/lib/http/*` and feature modules.
 */
export { default } from '@/lib/http/client'
export * from './parkingIotApi'
export * from './appApi'
export * from './chatApi'
