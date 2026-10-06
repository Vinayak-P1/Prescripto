/**
 * useVoiceRecognition - Hook for browser speech recognition
 * Uses the Web Speech API with graceful fallback
 */
import { useState, useRef, useCallback, useEffect } from 'react'

const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState(null)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef(null)
  const isStoppingRef = useRef(false)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setIsSupported(true)
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
        isStoppingRef.current = false
      }

      recognition.onresult = (event) => {
        let interim = ''
        let final = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            final += result[0].transcript
          } else {
            interim += result[0].transcript
          }
        }
        if (final) {
          setTranscript(final.trim())
          setInterimTranscript('')
        } else {
          setInterimTranscript(interim)
        }
      }

      recognition.onerror = (event) => {
        if (isStoppingRef.current) return
        let errorMessage = ''
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Microphone access was denied. Please allow microphone permission in your browser settings.'
            break
          case 'no-speech':
            errorMessage = 'No speech was detected. Please try again.'
            break
          case 'audio-capture':
            errorMessage = 'No microphone was found. Please connect a microphone.'
            break
          case 'network':
            errorMessage = 'Network error occurred. Please check your connection.'
            break
          case 'aborted':
            // User stopped - not an error
            break
          default:
            errorMessage = `Speech recognition error: ${event.error}`
        }
        if (errorMessage) setError(errorMessage)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
        isStoppingRef.current = false
      }

      recognitionRef.current = recognition
    } else {
      setIsSupported(false)
    }

    return () => {
      if (recognitionRef.current) {
        isStoppingRef.current = true
        try { recognitionRef.current.abort() } catch (e) { /* noop */ }
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return
    setTranscript('')
    setInterimTranscript('')
    setError(null)
    try {
      recognitionRef.current.start()
    } catch (e) {
      // May already be running
      try {
        recognitionRef.current.stop()
        setTimeout(() => {
          try { recognitionRef.current.start() } catch (err) { /* noop */ }
        }, 100)
      } catch (err) { /* noop */ }
    }
  }, [])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return
    isStoppingRef.current = true
    try {
      recognitionRef.current.stop()
    } catch (e) { /* noop */ }
  }, [])

  const clearTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    clearTranscript,
  }
}

export default useVoiceRecognition
