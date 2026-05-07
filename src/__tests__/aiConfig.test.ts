import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('AI assistant config', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it('is disabled unless explicitly enabled with a transport endpoint', async () => {
    vi.stubEnv('VITE_AI_ASSISTANT_ENABLED', 'true')
    vi.stubEnv('VITE_AI_ASSISTANT_ENDPOINT', '')

    const { getAIAssistantConfig } = await import('../lib/ai/config')

    expect(getAIAssistantConfig()).toEqual({
      enabled: false,
      transport: null,
    })
  })

  it('supports Supabase Edge Function transport without provider coupling', async () => {
    vi.stubEnv('VITE_AI_ASSISTANT_ENABLED', 'true')
    vi.stubEnv('VITE_AI_ASSISTANT_ENDPOINT', 'supabase:ai-assistant')

    const { getAIAssistantConfig } = await import('../lib/ai/config')

    expect(getAIAssistantConfig()).toEqual({
      enabled: true,
      transport: { kind: 'supabase-function', functionName: 'ai-assistant' },
    })
  })
})
