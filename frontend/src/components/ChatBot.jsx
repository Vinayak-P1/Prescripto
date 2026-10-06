import React, { useState, useRef, useEffect, useContext, useCallback } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import useVoiceRecognition from '../hooks/useVoiceRecognition'
import useSpeechSynthesis from '../hooks/useSpeechSynthesis'

// Voice state constants
const VOICE_STATE = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  SPEAKING: 'speaking',
  ERROR: 'error',
}

const ChatBot = () => {
  const { backendUrl, token } = useContext(AppContext)
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

  // Voice mode state
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [voiceState, setVoiceState] = useState(VOICE_STATE.IDLE)
  const [pendingAction, setPendingAction] = useState(null)
  const [voiceConversationHistory, setVoiceConversationHistory] = useState([])

  // Speech hooks
  const {
    isListening,
    transcript,
    interimTranscript,
    error: recognitionError,
    isSupported: recognitionSupported,
    startListening,
    stopListening,
    clearTranscript,
  } = useVoiceRecognition()

  const {
    isSpeaking,
    isSupported: synthSupported,
    isMuted,
    speak,
    stopSpeaking,
    toggleMute,
  } = useSpeechSynthesis()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen && inputRef.current && !isVoiceMode) {
      inputRef.current.focus()
    }
  }, [isOpen, isVoiceMode])

  // Sync voice state from hooks
  useEffect(() => {
    if (isListening) {
      setVoiceState(VOICE_STATE.LISTENING)
    } else if (isSpeaking) {
      setVoiceState(VOICE_STATE.SPEAKING)
    }
  }, [isListening, isSpeaking])

  // Handle recognition errors
  useEffect(() => {
    if (recognitionError) {
      setVoiceState(VOICE_STATE.ERROR)
      setMessages(prev => [...prev, {
        role: 'bot',
        content: recognitionError,
        isError: true,
      }])
    }
  }, [recognitionError])

  // Process transcript when speech recognition finishes
  useEffect(() => {
    if (transcript && !isListening && isVoiceMode) {
      handleVoiceMessage(transcript)
      clearTranscript()
    }
  }, [transcript, isListening])

  // --- Text Chat Handler (existing, preserved) ---
  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMessage = input.trim()
    setInput('')
    setShowBadge(false)

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

  // --- Voice Chat Handler ---
  const handleVoiceMessage = useCallback(async (userMessage, isConfirmation = false) => {
    if (!userMessage.trim()) return
    
    setShowBadge(false)
    setVoiceState(VOICE_STATE.PROCESSING)

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage, isVoice: true }])

    const updatedHistory = [
      ...voiceConversationHistory,
      { role: 'user', content: userMessage },
    ]

    try {
      if (!token) {
        const reply = "You'll need to log in to use the voice assistant's full features like booking appointments. Please log in and try again."
        setMessages(prev => [...prev, { role: 'bot', content: reply, isVoice: true }])
        speak(reply)
        setVoiceState(VOICE_STATE.SPEAKING)
        return
      }

      const requestBody = {
        message: userMessage,
        conversationHistory: updatedHistory.slice(-10),
      }

      // If there's a pending action and user confirmed
      if (isConfirmation && pendingAction) {
        requestBody.confirmAction = true
        requestBody.message = `Yes, confirm. ${userMessage}`
      }

      const { data } = await axios.post(
        backendUrl + '/api/ai/voice-chat',
        requestBody,
        { headers: { token }, timeout: 30000 }
      )

      if (data.success) {
        let replyContent = data.reply

        // Build rich message with tool results
        const messageData = {
          role: 'bot',
          content: replyContent,
          isVoice: true,
          toolResult: data.toolResult,
          action: data.action,
        }

        setMessages(prev => [...prev, messageData])

        // Update conversation history
        const newHistory = [
          ...updatedHistory,
          { role: 'assistant', content: replyContent },
        ]
        setVoiceConversationHistory(newHistory)

        // Handle pending confirmation
        if (data.requiresConfirmation && data.pendingAction) {
          setPendingAction(data.pendingAction)
        } else {
          setPendingAction(null)
        }

        // Speak the reply
        if (!isMuted) {
          speak(replyContent)
          setVoiceState(VOICE_STATE.SPEAKING)
        } else {
          setVoiceState(VOICE_STATE.IDLE)
        }
      } else {
        const errorReply = data.message || "I couldn't process that. Please try again."
        setMessages(prev => [...prev, { role: 'bot', content: errorReply, isVoice: true }])
        speak(errorReply)
        setVoiceState(VOICE_STATE.ERROR)
      }
    } catch (error) {
      console.error('Voice chat error:', error)
      let errorMessage = "Something went wrong. Please try again."
      if (error.code === 'ECONNABORTED') {
        errorMessage = "The request took too long. Please try again."
      } else if (!navigator.onLine) {
        errorMessage = "You appear to be offline. Please check your connection."
      }
      setMessages(prev => [...prev, { role: 'bot', content: errorMessage, isVoice: true, isError: true }])
      speak(errorMessage)
      setVoiceState(VOICE_STATE.ERROR)
    }
  }, [backendUrl, token, voiceConversationHistory, pendingAction, isMuted, speak])

  // --- Voice Controls ---
  const handleMicClick = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      stopSpeaking()
      startListening()
    }
  }, [isListening, startListening, stopListening, stopSpeaking])

  const handleVoiceTextSend = useCallback(() => {
    if (!input.trim() || voiceState === VOICE_STATE.PROCESSING) return
    const msg = input.trim()
    setInput('')
    
    // Check if this looks like a confirmation for a pending action
    const confirmWords = ['yes', 'confirm', 'go ahead', 'book it', 'sure', 'okay', 'ok', 'do it']
    const isConfirm = pendingAction && confirmWords.some(w => msg.toLowerCase().includes(w))
    
    handleVoiceMessage(msg, isConfirm)
  }, [input, voiceState, pendingAction, handleVoiceMessage])

  const toggleVoiceMode = useCallback(() => {
    if (!isVoiceMode) {
      // Switching to voice mode
      setIsVoiceMode(true)
      setVoiceState(VOICE_STATE.IDLE)
      setVoiceConversationHistory([])
      setPendingAction(null)
      // Add voice mode greeting if first time
      if (messages.length <= 1) {
        const greeting = "Voice mode activated! I can help you find doctors, check availability, and book appointments. Just tap the microphone and speak."
        setMessages(prev => [...prev, { role: 'bot', content: greeting, isVoice: true }])
        speak(greeting)
      }
    } else {
      // Switching to text mode
      stopSpeaking()
      if (isListening) stopListening()
      setIsVoiceMode(false)
      setVoiceState(VOICE_STATE.IDLE)
      setPendingAction(null)
    }
  }, [isVoiceMode, messages.length, isListening, stopListening, stopSpeaking, speak])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (isVoiceMode) {
        handleVoiceTextSend()
      } else {
        handleSend()
      }
    }
  }

  const quickActions = [
    { text: "Check my symptoms", icon: "🩺" },
    { text: "Find a doctor", icon: "👨‍⚕️" },
    { text: "Health tips", icon: "💡" },
  ]

  // --- Render Helper: Doctor Card ---
  const renderDoctorCards = (doctors) => {
    if (!doctors || doctors.length === 0) return null
    return (
      <div className="mt-2 space-y-2">
        {doctors.slice(0, 3).map((doc, i) => (
          <div key={i} className="bg-gradient-to-r from-primary/5 to-indigo-50 border border-primary/10 rounded-xl p-3 text-xs">
            <div className="flex items-center gap-2 mb-1">
              {doc.image && (
                <img src={doc.image} alt={doc.name} className="w-8 h-8 rounded-full object-cover bg-primary/20" />
              )}
              <div>
                <p className="font-semibold text-gray-800">{doc.name}</p>
                <p className="text-gray-500">{doc.speciality} · {doc.experience}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-primary font-medium">₹{doc.fees}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${doc.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {doc.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
        ))}
        {doctors.length > 3 && (
          <p className="text-[10px] text-gray-400 text-center">+{doctors.length - 3} more doctors found</p>
        )}
      </div>
    )
  }

  // --- Render Helper: Availability Slots ---
  const renderAvailabilitySlots = (availableSlots, doctor) => {
    if (!availableSlots || availableSlots.length === 0) return null
    return (
      <div className="mt-2">
        {doctor && (
          <p className="text-[11px] font-semibold text-gray-700 mb-1">
            Dr. {doctor.name} · ₹{doctor.fees}
          </p>
        )}
        <div className="space-y-1.5 max-h-32 overflow-y-auto">
          {availableSlots.slice(0, 4).map((day, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-lg p-2 text-[11px]">
              <p className="font-medium text-gray-700">{day.dayOfWeek} · {day.date}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {day.slots.slice(0, 6).map((time, j) => (
                  <span key={j} className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-[10px]">
                    {time}
                  </span>
                ))}
                {day.slots.length > 6 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-[10px]">
                    +{day.slots.length - 6} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // --- Render Helper: Appointments List ---
  const renderAppointments = (appointments) => {
    if (!appointments || appointments.length === 0) return null
    return (
      <div className="mt-2 space-y-1.5">
        {appointments.slice(0, 4).map((apt, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-lg p-2 text-[11px]">
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-700">Dr. {apt.doctor}</p>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                apt.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' :
                apt.status === 'Completed' ? 'bg-green-100 text-green-700' :
                'bg-red-100 text-red-700'
              }`}>
                {apt.status}
              </span>
            </div>
            <p className="text-gray-500">{apt.date} · {apt.time}</p>
          </div>
        ))}
      </div>
    )
  }

  // --- Render Helper: Booking Confirmation ---
  const renderBookingConfirmation = (appointment) => {
    if (!appointment) return null
    return (
      <div className="mt-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 text-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">✅</span>
          <p className="font-semibold text-green-800">Appointment Confirmed!</p>
        </div>
        <div className="space-y-1 text-gray-700">
          <p>👨‍⚕️ Dr. {appointment.doctor} ({appointment.speciality})</p>
          <p>📅 {appointment.date}</p>
          <p>🕐 {appointment.time}</p>
          <p>💰 ₹{appointment.fees}</p>
        </div>
      </div>
    )
  }

  // --- Voice state indicator ---
  const getVoiceStateLabel = () => {
    switch (voiceState) {
      case VOICE_STATE.LISTENING: return 'Listening...'
      case VOICE_STATE.PROCESSING: return 'Thinking...'
      case VOICE_STATE.SPEAKING: return 'Speaking...'
      case VOICE_STATE.ERROR: return 'Error occurred'
      default: return 'Tap mic to speak'
    }
  }

  const isProcessing = voiceState === VOICE_STATE.PROCESSING || isTyping

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] h-[560px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden"
          style={{ animation: 'slideUp 0.3s ease-out' }}
          id="chatbot-window"
        >
          {/* Header */}
          <div className={`text-white px-5 py-4 flex items-center justify-between flex-shrink-0 ${
            isVoiceMode
              ? 'bg-gradient-to-r from-violet-600 to-purple-500'
              : 'bg-gradient-to-r from-primary to-indigo-500'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg backdrop-blur-sm">
                {isVoiceMode ? '🎙️' : '🤖'}
              </div>
              <div>
                <p className="font-semibold text-sm">MedBot {isVoiceMode ? '· Voice' : ''}</p>
                <p className="text-xs text-white/70 flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                    isVoiceMode && voiceState === VOICE_STATE.LISTENING
                      ? 'bg-red-400 animate-pulse'
                      : 'bg-green-400'
                  }`} />
                  {isVoiceMode ? getVoiceStateLabel() : 'Online'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Voice mode toggle */}
              {recognitionSupported && (
                <button
                  onClick={toggleVoiceMode}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer text-sm ${
                    isVoiceMode ? 'bg-white/30 hover:bg-white/40' : 'hover:bg-white/20'
                  }`}
                  title={isVoiceMode ? 'Switch to text mode' : 'Switch to voice mode'}
                  id="voice-mode-toggle"
                >
                  {isVoiceMode ? '⌨️' : '🎤'}
                </button>
              )}
              {/* Mute toggle (voice mode) */}
              {isVoiceMode && synthSupported && (
                <button
                  onClick={toggleMute}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors cursor-pointer text-sm"
                  title={isMuted ? 'Unmute' : 'Mute voice'}
                  id="mute-toggle"
                >
                  {isMuted ? '🔇' : '🔊'}
                </button>
              )}
              {/* Stop speaking */}
              {isVoiceMode && isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors cursor-pointer text-sm"
                  title="Stop speaking"
                  id="stop-speaking"
                >
                  ⏹
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-lg cursor-pointer"
                id="close-chatbot"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%]`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? msg.isVoice
                          ? 'bg-violet-500 text-white rounded-br-md'
                          : 'bg-primary text-white rounded-br-md'
                        : msg.isError
                          ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-md'
                          : 'bg-white text-gray-700 border border-gray-100 rounded-bl-md shadow-sm'
                    }`}
                  >
                    {msg.isVoice && msg.role === 'user' && (
                      <span className="text-[10px] opacity-70 mr-1">🎤</span>
                    )}
                    {msg.content}
                  </div>

                  {/* Tool result renders */}
                  {msg.toolResult && msg.toolResult.success && msg.action === 'searchDoctors' && (
                    renderDoctorCards(msg.toolResult.doctors)
                  )}
                  {msg.toolResult && msg.toolResult.success && msg.action === 'checkAvailability' && (
                    renderAvailabilitySlots(msg.toolResult.availableSlots, msg.toolResult.doctor)
                  )}
                  {msg.toolResult && msg.toolResult.success && msg.action === 'getMyAppointments' && (
                    renderAppointments(msg.toolResult.appointments)
                  )}
                  {msg.toolResult && msg.toolResult.success && msg.action === 'bookAppointment' && (
                    renderBookingConfirmation(msg.toolResult.appointment)
                  )}
                </div>
              </div>
            ))}

            {/* Typing / Processing Indicator */}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-500 px-4 py-3 rounded-2xl rounded-bl-md border border-gray-100 shadow-sm flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {/* Interim transcript while listening */}
            {isVoiceMode && isListening && interimTranscript && (
              <div className="flex justify-end">
                <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-md bg-violet-300/50 text-violet-800 text-sm italic border border-violet-200">
                  🎤 {interimTranscript}...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions (shown only at start, text mode) */}
          {!isVoiceMode && messages.length <= 1 && (
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

          {/* Voice Mode Controls */}
          {isVoiceMode && (
            <div className="px-3 py-3 border-t border-gray-100 flex-shrink-0 bg-white">
              {/* Central mic button */}
              <div className="flex items-center justify-center mb-2">
                <button
                  onClick={handleMicClick}
                  disabled={isProcessing}
                  className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isListening
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110'
                      : isProcessing
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/30 hover:scale-105 active:scale-95'
                  }`}
                  id="voice-mic-button"
                >
                  {isListening && (
                    <>
                      <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
                      <span className="absolute inset-[-4px] rounded-full border-2 border-red-400 animate-[voicePulse_1.5s_ease-in-out_infinite]" />
                    </>
                  )}
                  <span className="text-2xl relative z-10">
                    {isListening ? '⏹' : isProcessing ? '⏳' : '🎤'}
                  </span>
                </button>
              </div>

              {/* Text fallback input */}
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={pendingAction ? "Say 'yes' to confirm or 'no' to cancel..." : "Or type your message..."}
                  className="flex-1 px-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 placeholder-gray-400"
                  id="voice-text-input"
                  disabled={isProcessing}
                />
                <button
                  onClick={handleVoiceTextSend}
                  disabled={!input.trim() || isProcessing}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all text-sm ${
                    input.trim() && !isProcessing
                      ? 'bg-violet-500 text-white hover:bg-violet-600 cursor-pointer'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  id="voice-text-send"
                >
                  ➤
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                Voice assistant · Not a substitute for medical advice
              </p>
            </div>
          )}

          {/* Text Mode Input */}
          {!isVoiceMode && (
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
                {/* Mic button in text mode */}
                {recognitionSupported && (
                  <button
                    onClick={toggleVoiceMode}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-50 text-violet-500 hover:bg-violet-100 transition-all cursor-pointer border border-violet-200"
                    title="Switch to voice mode"
                    id="chatbot-voice-btn"
                  >
                    🎤
                  </button>
                )}
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
          )}
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

      {/* CSS Animations */}
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
        @keyframes voicePulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.2;
          }
        }
      `}</style>
    </>
  )
}

export default ChatBot
