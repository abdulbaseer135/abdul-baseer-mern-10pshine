import { useRef, useState, useCallback, useEffect } from 'react'

/**
 * Production-grade voice-to-text hook with continuous listening
 * - Auto-restarts after timeouts/pauses (fixes "stops after certain word length")
 * - Accepts continuous voice input without interruption
 * - Returns interim + final text separately
 * - Works identically in all components
 */
const useSpeechToText = () => {
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [finalText, setFinalText] = useState('')
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)
  const shouldRestartRef = useRef(false)
  const restartTimeoutRef = useRef(null)

  const isSupported = !!(
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)
  )

  const createRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return null

    const r = new SR()
    r.continuous = true
    r.interimResults = true
    r.maxAlternatives = 1
    r.lang = 'en-US'

    r.onstart = () => {
      console.debug('[Voice] Recognition started')
      setIsListening(true)
      // Clear any pending restart timeout when recognition starts
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
        restartTimeoutRef.current = null
      }
    }

    r.onresult = (event) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += t
        } else {
          interim += t
        }
      }

      if (interim) {
        console.debug('[Voice] Interim:', interim)
        setInterimText(interim)
      }
      if (final) {
        console.debug('[Voice] Final:', final)
        setFinalText(final)
        setInterimText('')
      }
    }

    r.onerror = (e) => {
      console.warn('[Voice] Error:', e.error)
      // Don't stop on these errors - they're normal during continuous listening
      if (e.error === 'no-speech') {
        console.debug('[Voice] No speech detected, will restart if still listening')
        return
      }
      if (e.error === 'aborted') {
        console.debug('[Voice] Recognition aborted')
        return
      }
      if (e.error === 'not-allowed') {
        setError('Microphone permission denied. Please allow microphone access in your browser settings.')
        setIsListening(false)
        shouldRestartRef.current = false
        return
      }
      if (e.error === 'network') {
        setError('Network error. Please check your connection.')
        return
      }
    }

    // ✅ AUTO-RESTART with minimal delay — fixes "stops after specific word length"
    r.onend = () => {
      console.debug('[Voice] Recognition ended, shouldRestart:', shouldRestartRef.current)
      
      if (shouldRestartRef.current) {
        // Use immediate restart with minimal delay (10ms) to avoid user-noticeable gaps
        restartTimeoutRef.current = setTimeout(() => {
          try {
            console.debug('[Voice] Restarting recognition...')
            r.start()
          } catch (err) {
            console.debug('[Voice] Error restarting:', err.message)
            // If start fails, retry immediately
            try {
              r.start()
            } catch (e) {
              console.warn('[Voice] Failed to restart:', e.message)
            }
          }
        }, 10)
      } else {
        setIsListening(false)
        setInterimText('')
      }
    }

    return r
  }, [])

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      recognitionRef.current = createRecognition()
    }
    
    const r = recognitionRef.current
    if (!r) {
      console.warn('[Voice] Recognition not available')
      return
    }
    
    shouldRestartRef.current = true
    setError(null)
    setFinalText('')
    setInterimText('')
    
    try {
      console.debug('[Voice] Starting recognition')
      r.start()
    } catch (e) {
      console.warn('[Voice] Error starting:', e.message)
    }
  }, [createRecognition])

  const stopListening = useCallback(() => {
    console.debug('[Voice] Stopping listening')
    shouldRestartRef.current = false
    
    // Clear restart timeout
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
      restartTimeoutRef.current = null
    }
    
    recognitionRef.current?.stop()
    setIsListening(false)
    setInterimText('')
  }, [])

  const resetFinalText = useCallback(() => {
    setFinalText('')
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldRestartRef.current = false
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
      }
      recognitionRef.current?.stop()
    }
  }, [])

  return {
    isListening,
    interimText,
    finalText,
    error,
    resetFinalText,
    startListening,
    stopListening,
    isSupported,
  }
}

export default useSpeechToText
