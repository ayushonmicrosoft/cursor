import { supabase } from '../supabase'
import { getAIAssistantConfig } from './config'
import type { AIAssistantRequest, AIAssistantResponse } from './types'

function isAIAssistantResponse(value: unknown): value is AIAssistantResponse {
  const candidate = value as Partial<AIAssistantResponse> | null
  return (
    Boolean(candidate) &&
    candidate?.message?.role === 'assistant' &&
    typeof candidate.message.content === 'string'
  )
}

export async function requestAIAssistant(
  request: AIAssistantRequest,
): Promise<AIAssistantResponse> {
  const config = getAIAssistantConfig()
  if (!config.enabled || !config.transport) {
    throw new Error('AI assistant is not configured.')
  }

  if (config.transport.kind === 'supabase-function') {
    const { data, error } = await supabase.functions.invoke(
      config.transport.functionName,
      { body: request },
    )
    if (error) throw error
    if (!isAIAssistantResponse(data)) {
      throw new Error('AI assistant returned an unexpected response.')
    }
    return data
  }

  const response = await fetch(config.transport.endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!response.ok) {
    throw new Error(`AI assistant request failed with ${response.status}.`)
  }

  const data = (await response.json()) as unknown
  if (!isAIAssistantResponse(data)) {
    throw new Error('AI assistant returned an unexpected response.')
  }
  return data
}
