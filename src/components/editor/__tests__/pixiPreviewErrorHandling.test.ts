import { describe, expect, it } from 'vitest'
import { classifyPixiError } from '../PixiPreviewPage'

describe('classifyPixiError', () => {
  it('keeps warning messages without fallback', () => {
    const result = classifyPixiError({
      severity: 'warning',
      code: 'pixi-slow-frames',
      message: 'Pixi is rendering slowly. The preview is still open.',
    })

    expect(result).toEqual({
      message: 'Pixi is rendering slowly. The preview is still open.',
      shouldFallback: false,
    })
  })

  it('marks fatal errors for fallback', () => {
    const result = classifyPixiError({
      severity: 'fatal',
      code: 'pixi-init-failure',
      message: 'Pixi failed to initialize in this browser context.',
    })

    expect(result).toEqual({
      message: 'Pixi failed to initialize in this browser context.',
      shouldFallback: true,
    })
  })
})
