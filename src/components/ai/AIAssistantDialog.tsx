import { useEffect, useMemo, useState } from 'react'
import { Bot, Send, ShieldCheck } from 'lucide-react'
import { Modal, ModalBody, ModalFooter } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useUIStore } from '../../stores/uiStore'
import { getAIAssistantConfig, requestAIAssistant } from '../../lib/ai'
import type { AIAssistantMessage } from '../../lib/ai'

export function AIAssistantDialog() {
  const open = useUIStore((s) => s.aiAssistantOpen)
  const setOpen = useUIStore((s) => s.setAIAssistantOpen)
  const registerModalOpen = useUIStore((s) => s.registerModalOpen)
  const registerModalClose = useUIStore((s) => s.registerModalClose)
  const config = useMemo(() => getAIAssistantConfig(), [])
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState<AIAssistantMessage[]>([])
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    registerModalOpen()
    return () => registerModalClose()
  }, [open, registerModalOpen, registerModalClose])

  const submit = async () => {
    const content = prompt.trim()
    if (!content || !config.enabled) return
    const nextMessages: AIAssistantMessage[] = [
      ...messages,
      { role: 'user', content },
    ]
    setMessages(nextMessages)
    setPrompt('')
    setStatus('sending')
    setError(null)

    try {
      const response = await requestAIAssistant({
        messages: nextMessages,
        metadata: { surface: 'assistant-dialog' },
      })
      setMessages([...nextMessages, response.message])
      setStatus('idle')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'AI assistant request failed.')
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      title="AI assistant"
      size="lg"
    >
      <ModalBody className="space-y-4">
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-100">
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium">Privacy-safe by default</p>
              <p className="mt-1 text-blue-800 dark:text-blue-200">
                This foundation only sends the text you type here. Office maps,
                rosters, emails, and project payloads are not attached unless a
                future configured workflow explicitly opts in.
              </p>
            </div>
          </div>
        </div>

        {!config.enabled ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
            <Bot size={28} className="mx-auto text-gray-400" aria-hidden="true" />
            <h3 className="mt-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Assistant is not configured
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Set <code>VITE_AI_ASSISTANT_ENABLED=true</code> and
              <code> VITE_AI_ASSISTANT_ENDPOINT</code> to an approved backend
              endpoint or <code>supabase:function-name</code> to enable it.
            </p>
          </div>
        ) : (
          <>
            <div className="max-h-72 space-y-3 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950/30">
              {messages.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ask a general workspace-planning question. No office context is
                  sent automatically.
                </p>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={
                      message.role === 'user'
                        ? 'ml-auto max-w-[85%] rounded-lg bg-blue-600 px-3 py-2 text-sm text-white'
                        : 'mr-auto max-w-[85%] rounded-lg bg-white px-3 py-2 text-sm text-gray-800 shadow-sm dark:bg-gray-900 dark:text-gray-100'
                    }
                  >
                    {message.content}
                  </div>
                ))
              )}
            </div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Prompt
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="mt-1 block w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                placeholder="Example: suggest questions to ask before reorganizing a seating plan"
              />
            </label>
            {error ? (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            ) : null}
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Close
        </Button>
        {config.enabled ? (
          <Button
            type="button"
            variant="primary"
            disabled={status === 'sending' || prompt.trim().length === 0}
            leftIcon={<Send size={14} aria-hidden="true" />}
            onClick={() => void submit()}
          >
            {status === 'sending' ? 'Asking...' : 'Ask'}
          </Button>
        ) : null}
      </ModalFooter>
    </Modal>
  )
}
