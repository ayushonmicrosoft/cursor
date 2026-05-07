import type { PixiStageError } from './Canvas/PixiStage'

export function classifyPixiError(error: PixiStageError): {
  message: string
  shouldFallback: boolean
} {
  return {
    message: error.message,
    shouldFallback: error.severity === 'fatal',
  }
}
