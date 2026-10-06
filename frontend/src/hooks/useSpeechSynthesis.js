/**
 * useSpeechSynthesis - Hook for browser text-to-speech
 * Uses the Web Speech Synthesis API with queue management
 */
import { useState, useRef, useCallback, useEffect } from 'react'

const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const utteranceRef = useRef(null)

  useEffect(() => {
    setIsSupported('speechSynthesis' in window)
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const speak = useCallback((text) => {
    if (!('speechSynthesis' in window) || isMuted || !text) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0
    utterance.lang = 'en-US'

    // Try to pick a natural-sounding voice
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v =>
      v.name.includes('Google') && v.lang.startsWith('en')
    ) || voices.find(v =>
      v.lang.startsWith('en') && !v.name.includes('espeak')
    )
    if (preferred) utterance.voice = preferred

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = (e) => {
      if (e.error !== 'canceled') {
        console.log('Speech synthesis error:', e.error)
      }
      setIsSpeaking(false)
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [isMuted])

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      if (!prev) {
        // Muting - stop any current speech
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel()
        }
        setIsSpeaking(false)
      }
      return !prev
    })
  }, [])

  return {
    isSpeaking,
    isSupported,
    isMuted,
    speak,
    stopSpeaking,
    toggleMute,
  }
}

export default useSpeechSynthesis
