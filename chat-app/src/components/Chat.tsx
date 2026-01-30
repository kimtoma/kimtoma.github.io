import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Trash2, Moon, Sun, ThumbsUp, ThumbsDown, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { marked } from 'marked'

interface Message {
  role: 'user' | 'assistant'
  content: string
  isTyping?: boolean
  id?: number
}

interface FeedbackState {
  [key: number]: 'like' | 'dislike' | null
}

// Cloudflare Worker with D1 logging
const API_BASE = 'https://gemini-proxy-with-logging.kimtoma.workers.dev'
const API_ENDPOINT = `${API_BASE}/chat`
const FEEDBACK_ENDPOINT = `${API_BASE}/feedback`
const STORAGE_KEY = 'chat_messages'
const SESSION_KEY = 'chat_session_id'
const FEEDBACK_KEY = 'chat_feedback'

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
})

// Split text into sentences
function splitIntoSentences(text: string): string[] {
  // Split by sentence endings, keeping the delimiter
  const sentences = text.split(/(?<=[.!?。！？\n])\s*/g).filter(s => s.trim())

  // If no sentences found, split by newlines or return as single chunk
  if (sentences.length === 0) {
    return text.split('\n').filter(s => s.trim())
  }

  return sentences
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const [typingContent, setTypingContent] = useState('')
  const [sessionId, setSessionId] = useState<string>('')
  const [feedback, setFeedback] = useState<FeedbackState>({})
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const typingRef = useRef<boolean>(false)
  const messageIdCounter = useRef<number>(0)

  // Load messages from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Remove any typing flags from saved messages, ensure IDs
        const loadedMessages = parsed.map((m: Message, i: number) => ({
          ...m,
          isTyping: false,
          id: m.id || i + 1
        }))
        setMessages(loadedMessages)
        // Set counter to max ID + 1
        const maxId = Math.max(...loadedMessages.map((m: Message) => m.id || 0), 0)
        messageIdCounter.current = maxId
      } catch (e) {
        console.error('Failed to parse saved messages', e)
      }
    }

    // Load or create session ID
    let storedSessionId = localStorage.getItem(SESSION_KEY)
    if (!storedSessionId) {
      storedSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem(SESSION_KEY, storedSessionId)
    }
    setSessionId(storedSessionId)

    // Load feedback
    const savedFeedback = localStorage.getItem(FEEDBACK_KEY)
    if (savedFeedback) {
      try {
        setFeedback(JSON.parse(savedFeedback))
      } catch (e) {
        console.error('Failed to parse saved feedback', e)
      }
    }

    // Load theme preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setIsDark(savedTheme === 'dark')
    } else {
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
  }, [])

  // Save messages to localStorage (exclude typing state)
  useEffect(() => {
    const toSave = messages.map(m => ({ role: m.role, content: m.content, id: m.id }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  }, [messages])

  // Save feedback to localStorage
  useEffect(() => {
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedback))
  }, [feedback])

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingContent])

  // Typing effect
  const typeMessage = useCallback(async (fullContent: string) => {
    typingRef.current = true
    setIsTyping(true)
    setTypingContent('')

    const sentences = splitIntoSentences(fullContent)
    let accumulated = ''

    for (const sentence of sentences) {
      if (!typingRef.current) break

      // Add sentence character by character for smooth effect
      for (let i = 0; i < sentence.length; i++) {
        if (!typingRef.current) break
        accumulated += sentence[i]
        setTypingContent(accumulated)
        // Faster typing speed
        await new Promise(resolve => setTimeout(resolve, 15))
      }

      // Small pause between sentences
      if (typingRef.current) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    // Typing complete - add full message
    if (typingRef.current) {
      messageIdCounter.current += 1
      setMessages(prev => [...prev, { role: 'assistant', content: fullContent, id: messageIdCounter.current }])
    }

    setIsTyping(false)
    setTypingContent('')
    typingRef.current = false
  }, [])

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading || isTyping) return

    messageIdCounter.current += 1
    const userMessage: Message = { role: 'user', content: input.trim(), id: messageIdCounter.current }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages,
          sessionId: sessionId,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Update session ID if returned from server
      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId)
        localStorage.setItem(SESSION_KEY, data.sessionId)
      }

      setIsLoading(false)
      // Start typing effect
      await typeMessage(data.response)
    } catch (error) {
      setIsLoading(false)
      const errorContent = `오류가 발생했습니다. ${error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.'}`
      setMessages(prev => [...prev, { role: 'assistant', content: errorContent }])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearMessages = () => {
    typingRef.current = false
    setIsTyping(false)
    setTypingContent('')
    setMessages([])
    setFeedback({})
    messageIdCounter.current = 0
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(FEEDBACK_KEY)
    // Generate new session ID
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setSessionId(newSessionId)
    localStorage.setItem(SESSION_KEY, newSessionId)
  }

  const submitFeedback = async (messageId: number, type: 'like' | 'dislike') => {
    // If already same feedback, remove it
    if (feedback[messageId] === type) {
      setFeedback(prev => ({ ...prev, [messageId]: null }))
      return
    }

    setFeedback(prev => ({ ...prev, [messageId]: type }))

    try {
      await fetch(FEEDBACK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: messageId,
          session_id: sessionId,
          feedback: type,
        }),
      })
    } catch (e) {
      console.error('Failed to submit feedback', e)
    }
  }

  const copyToClipboard = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (e) {
      console.error('Failed to copy', e)
    }
  }

  const renderMarkdown = (content: string) => {
    return { __html: marked.parse(content) as string }
  }

  return (
    <div className="flex flex-col h-screen-safe max-w-2xl mx-auto relative">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img
            src="https://github.com/kimtoma.png"
            alt="kimtoma"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h1 className="font-semibold text-foreground">kimtoma</h1>
            <p className="text-xs text-muted-foreground">
              {isLoading ? '생각 중...' : isTyping ? '입력 중...' : 'AI Assistant'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(event) => {
              const next = !isDark

              // Fallback for browsers without View Transition API
              if (!document.startViewTransition) {
                setIsDark(next)
                return
              }

              // Get click position for circular animation
              const x = event.clientX
              const y = event.clientY
              const maxRadius = Math.hypot(
                Math.max(x, window.innerWidth - x),
                Math.max(y, window.innerHeight - y)
              )

              // Start view transition with circular reveal
              const transition = document.startViewTransition(() => {
                setIsDark(next)
              })

              transition.ready.then(() => {
                const clipPath = [
                  `circle(0px at ${x}px ${y}px)`,
                  `circle(${maxRadius}px at ${x}px ${y}px)`
                ]

                document.documentElement.animate(
                  { clipPath: next ? [...clipPath].reverse() : clipPath },
                  {
                    duration: 500,
                    easing: 'ease-out',
                    pseudoElement: next
                      ? '::view-transition-old(root)'
                      : '::view-transition-new(root)'
                  }
                )
              })
            }}
            className="text-muted-foreground"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearMessages}
            className="text-muted-foreground"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 pb-24">
        {messages.length === 0 && !isTyping ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <img
              src="https://github.com/kimtoma.png"
              alt="kimtoma"
              className="w-16 h-16 rounded-full mb-4 border-2 border-primary/20"
            />
            <h2 className="text-lg font-medium text-foreground mb-2">kimtoma에게 물어보세요</h2>
            <p className="text-sm max-w-xs">
              AI 에이전트, UX 디자인, 서비스 기획 등<br />
              무엇이든 물어보세요!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => {
              // User message - single bubble
              if (message.role === 'user') {
                return (
                  <div key={index} className="flex justify-end">
                    <div
                      className="bubble-user markdown-content"
                      dangerouslySetInnerHTML={renderMarkdown(message.content)}
                    />
                  </div>
                )
              }

              // Assistant message - split by paragraphs (smart grouping)
              const rawParagraphs = message.content.split(/\n\n+/).filter(p => p.trim())

              // Group short paragraphs together (min 100 chars per bubble)
              const paragraphs: string[] = []
              let currentGroup = ''
              for (const p of rawParagraphs) {
                if (currentGroup.length === 0) {
                  currentGroup = p
                } else if (currentGroup.length + p.length < 100) {
                  currentGroup += '\n\n' + p
                } else {
                  paragraphs.push(currentGroup)
                  currentGroup = p
                }
              }
              if (currentGroup) paragraphs.push(currentGroup)

              return (
                <div key={index} className="flex justify-start gap-2">
                  <img
                    src="https://github.com/kimtoma.png"
                    alt="kimtoma"
                    className="w-8 h-8 rounded-full flex-shrink-0 mt-1"
                  />
                  <div className="flex flex-col gap-1 max-w-[85%]">
                    {paragraphs.map((paragraph, pIndex) => (
                      <div
                        key={pIndex}
                        className="bubble-assistant markdown-content"
                        dangerouslySetInnerHTML={renderMarkdown(paragraph)}
                      />
                    ))}
                    {message.id && (
                      <div className="flex items-center gap-1 mt-1 ml-1">
                        <button
                          onClick={() => submitFeedback(message.id!, 'like')}
                          className={cn(
                            "p-1.5 rounded-md transition-colors",
                            feedback[message.id] === 'like'
                              ? "text-primary bg-primary/10"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          )}
                          title="좋아요"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => submitFeedback(message.id!, 'dislike')}
                          className={cn(
                            "p-1.5 rounded-md transition-colors",
                            feedback[message.id] === 'dislike'
                              ? "text-destructive bg-destructive/10"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          )}
                          title="별로에요"
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => copyToClipboard(message.content, index)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="복사"
                        >
                          {copiedIndex === index ? (
                            <Check className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start gap-2">
                <img
                  src="https://github.com/kimtoma.png"
                  alt="kimtoma"
                  className="w-8 h-8 rounded-full flex-shrink-0 mt-1"
                />
                <div className="bubble-assistant">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Typing effect - single bubble during typing */}
            {isTyping && typingContent && (
              <div className="flex justify-start gap-2">
                <img
                  src="https://github.com/kimtoma.png"
                  alt="kimtoma"
                  className="w-8 h-8 rounded-full flex-shrink-0 mt-1"
                />
                <div className="flex flex-col gap-1 max-w-[85%]">
                  <div
                    className="bubble-assistant markdown-content"
                    dangerouslySetInnerHTML={renderMarkdown(typingContent)}
                  />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="input-container border-t border-border bg-background p-4 max-w-2xl mx-auto w-full">
        <div className="flex items-end gap-2 bg-secondary rounded-2xl px-4 py-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            disabled={isLoading || isTyping}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-foreground placeholder:text-muted-foreground text-sm py-1.5 max-h-[120px]"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading || isTyping}
            size="icon"
            className="h-8 w-8 rounded-full shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          kimtoma는 AI이며 실수할 수 있어요. 응답을 다시 한번 확인해주세요.
        </p>
      </div>
    </div>
  )
}
