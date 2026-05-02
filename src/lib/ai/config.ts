import type { AIAssistantConfig, AITransport } from './types'

const enabledFlag = import.meta.env.VITE_AI_ASSISTANT_ENABLED
const endpoint = import.meta.env.VITE_AI_ASSISTANT_ENDPOINT?.trim() ?? ''

function parseTransport(value: string): AITransport | null {
  if (!value) return null
  if (value.startsWith('supabase:')) {
    const functionName = value.slice('supabase:'.length).trim()
    return functionName ? { kind: 'supabase-function', functionName } : null
  }
  return { kind: 'http', endpoint: value }
}

export function getAIAssistantConfig(): AIAssistantConfig {
  const transport = parseTransport(endpoint)
  return {
    enabled: enabledFlag === 'true' && transport !== null,
    transport,
  }
}

export function isAIAssistantAvailable(): boolean {
  return getAIAssistantConfig().enabled
}
