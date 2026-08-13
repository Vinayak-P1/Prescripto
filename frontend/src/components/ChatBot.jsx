import React, { useState, useRef, useEffect, useContext } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'

const ChatBot = () => {
  const { backendUrl } = useContext(AppContext)
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content:
        "Hi! I'm MedBot 🤖, your AI health assistant. I can help you with health queries, finding doctors, or booking guidance. How can I help you today?",
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showBadge, setShowBadge] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMessage = input.trim()
    setInput('')
    setShowBadge(false)

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsTyping(true)

    try {
      const conversationHistory = messages.slice(-6).map((m) => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.content,
      }))

      const { data } = await axios.post(backendUrl + '/api/ai/chat', {
        message: userMessage,
        conversationHistory,
      })

      if (data.success) {
        setMessages((prev) => [...prev, { role: 'bot', content: data.reply }])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            content: "Sorry, I'm having trouble right now. Please try again! 🙏",
          },
        ])
      }
    } catch (error) {
      console.error(error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content:
            "Oops! Something went wrong. Please check your connection and try again. 😊",
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickActions = [
    { text: "Check my symptoms", icon: "🩺" },
    { text: "Find a doctor", icon: "👨‍⚕️" },
    { text: "Health tips", icon: "💡" },
  ]

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden animate-[slideUp_0.3s_ease-out]"
          style={{
            animation: 'slideUp 0.3s ease-out',
          }}
          id="chatbot-window"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-indigo-500 text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg backdrop-blur-sm">
                🤖
              </div>
              <div>
                <p className="font-semibold text-sm">MedBot</p>
                <p className="text-xs text-white/70 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-lg cursor-pointer"
              id="close-chatbot"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-white text-gray-700 border border-gray-100 rounded-bl-md shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-500 px-4 py-3 rounded-2xl rounded-bl-md border border-gray-100 shadow-sm flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions (shown only at start) */}
          {messages.length <= 1 && (
            <div className="px-4 py-2 border-t border-gray-100 flex gap-2 flex-shrink-0 bg-white">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(action.text)
                    setTimeout(() => {
                      setInput(action.text)
                      handleSend()
                    }, 100)
                  }}
                  className="flex-1 text-xs px-2 py-2 bg-primary/5 text-primary border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer"
                >
                  {action.icon} {action.text}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-100 flex-shrink-0 bg-white">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your health question..."
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder-gray-400"
                id="chatbot-input"
                disabled={isTyping}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  input.trim() && !isTyping
                    ? 'bg-primary text-white hover:bg-primary/90 cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                id="chatbot-send"
              >
                ➤
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 text-center">
              AI assistant · Not a substitute for medical advice
            </p>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          setShowBadge(false)
        }}
        className={`fixed bottom-6 right-4 sm:right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl z-50 transition-all hover:scale-110 active:scale-95 cursor-pointer ${
          isOpen
            ? 'bg-gray-700 text-white rotate-0'
            : 'bg-gradient-to-r from-primary to-indigo-500 text-white'
        }`}
        id="chatbot-toggle"
        style={{
          boxShadow: isOpen ? '0 4px 15px rgba(0,0,0,0.2)' : '0 4px 20px rgba(95, 111, 255, 0.4)',
        }}
      >
        {isOpen ? '✕' : '💬'}

        {/* Notification Badge */}
        {!isOpen && showBadge && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">
            1
          </span>
        )}
      </button>

      {/* CSS Animation */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  )
}

export default ChatBot
