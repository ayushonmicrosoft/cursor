export type AIAssistantRole = 'user' | 'assistant' | 'system'

export interface AIAssistantMessage {
  role: AIAssistantRole
  content: string
}

export interface AIAssistantRequest {
  messages: AIAssistantMessage[]
  metadata: {
    surface: 'assistant-dialog' | 'command-palette'
  }
}

export interface AIAssistantResponse {
  message: AIAssistantMessage
}

export type AITransport =
  | { kind: 'supabase-function'; functionName: string }
  | { kind: 'http'; endpoint: string }

export interface AIAssistantConfig {
  enabled: boolean
  transport: AITransport | null
}
